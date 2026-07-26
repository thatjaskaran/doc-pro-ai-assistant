'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';

const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:MM format');

const baseSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  closed: z.coerce.boolean(),
});

const hoursSchema = z.object({
  workStart: timeStringSchema,
  workEnd: timeStringSchema,
  breakStart: z.union([timeStringSchema, z.literal('')]),
  breakEnd: z.union([timeStringSchema, z.literal('')]),
  sessionDurationMinutes: z.coerce.number().int().min(10).max(120),
});

function timeStringToDate(hhmm: string): Date {
  return new Date(`1970-01-01T${hhmm}:00Z`);
}

export async function updateAvailability(formData: FormData) {
  const session = await requireRole('DOCTOR');

  const base = baseSchema.safeParse({
    dayOfWeek: formData.get('dayOfWeek'),
    closed: formData.get('closed') === 'on',
  });
  if (!base.success) return { error: 'Invalid request.' };

  const doctorProfile = await prisma.doctorProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  const { dayOfWeek, closed } = base.data;

  if (closed) {
    // When closed, the hour/break/session-length inputs are never rendered,
    // so there's genuinely nothing to read from formData for them and
    // nothing to validate -- fall through into hoursSchema here would
    // always fail on fields the client never sent. Delete any existing
    // template for this day and stop.
    await prisma.doctorAvailability.deleteMany({
      where: { doctorProfileId: doctorProfile.id, dayOfWeek },
    });
    revalidatePath('/doctor/availability');
    return { success: true };
  }

  const hours = hoursSchema.safeParse({
    workStart: formData.get('workStart'),
    workEnd: formData.get('workEnd'),
    breakStart: formData.get('breakStart') ?? '',
    breakEnd: formData.get('breakEnd') ?? '',
    sessionDurationMinutes: formData.get('sessionDurationMinutes'),
  });
  if (!hours.success) return { error: hours.error.issues[0]?.message ?? 'Invalid input.' };

  const workStart = timeStringToDate(hours.data.workStart);
  const workEnd = timeStringToDate(hours.data.workEnd);
  if (workEnd <= workStart) return { error: 'Working hours end must be after start.' };

  let breakStart: Date | null = null;
  let breakEnd: Date | null = null;
  if (hours.data.breakStart && hours.data.breakEnd) {
    breakStart = timeStringToDate(hours.data.breakStart);
    breakEnd = timeStringToDate(hours.data.breakEnd);
    if (breakEnd <= breakStart) return { error: 'Break end must be after break start.' };
    if (breakStart < workStart || breakEnd > workEnd) return { error: 'Break must fall within working hours.' };
  }

  await prisma.doctorAvailability.upsert({
    where: { doctorProfileId_dayOfWeek: { doctorProfileId: doctorProfile.id, dayOfWeek } },
    update: { workStart, workEnd, breakStart, breakEnd, sessionDurationMinutes: hours.data.sessionDurationMinutes },
    create: {
      doctorProfileId: doctorProfile.id, dayOfWeek, workStart, workEnd, breakStart, breakEnd,
      sessionDurationMinutes: hours.data.sessionDurationMinutes,
    },
  });

  revalidatePath('/doctor/availability');
  return { success: true };
}