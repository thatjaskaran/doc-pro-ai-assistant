'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';
import { isCancellable } from '@/lib/scheduling/policy';

const cancelSchema = z.object({ appointmentId: z.string().uuid() });

export async function cancelAppointment(formData: FormData) {
  const session = await requireRole('PATIENT');
  const parsed = cancelSchema.safeParse({ appointmentId: formData.get('appointmentId') });
  if (!parsed.success) return { error: 'Invalid request.' };

  const patientProfile = await prisma.patientProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  });

  // Ownership check is the load-bearing security control here -- without
  // scoping to patientProfileId, any authenticated patient could cancel any
  // other patient's appointment just by knowing/guessing its ID.
  const appointment = await prisma.appointment.findFirst({
    where: { id: parsed.data.appointmentId, patientProfileId: patientProfile.id },
  });
  if (!appointment) return { error: 'Appointment not found.' };

  if (appointment.status !== 'PENDING' && appointment.status !== 'CONFIRMED') {
    return { error: 'This appointment can no longer be cancelled.' };
  }
  if (!isCancellable(appointment.startUtc)) {
    return { error: 'Cancellations must be made at least 2 hours before the appointment.' };
  }

  await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELLED' },
    }),
    prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: appointment.id,
        fromStatus: appointment.status,
        toStatus: 'CANCELLED',
        changedByUserId: session.user.id,
      },
    }),
  ]);

  revalidatePath('/patient/dashboard');
  return { success: true };
}

const ratingSchema = z.object({
  appointmentId: z.string().uuid(),
  score: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function submitRating(formData: FormData) {
  const session = await requireRole('PATIENT');
  const parsed = ratingSchema.safeParse({
    appointmentId: formData.get('appointmentId'),
    score: formData.get('score'),
    comment: formData.get('comment') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid rating.' };

  const patientProfile = await prisma.patientProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  });

  const appointment = await prisma.appointment.findFirst({
    where: { id: parsed.data.appointmentId, patientProfileId: patientProfile.id },
  });
  if (!appointment) return { error: 'Appointment not found.' };
  if (appointment.status !== 'COMPLETED') return { error: 'You can only rate completed appointments.' };

  const existing = await prisma.appointmentRating.findUnique({
    where: { appointmentId: appointment.id },
  });
  if (existing) return { error: 'You have already rated this appointment.' };

  // A callback transaction, not an array of promises like cancelAppointment
  // uses -- the aggregate recompute below needs to run AFTER the create
  // commits, so the operations aren't independent and can't be built as a
  // flat array up front the way the simpler cases elsewhere are.
  await prisma.$transaction(async (tx) => {
    await tx.appointmentRating.create({
      data: {
        appointmentId: appointment.id,
        patientProfileId: patientProfile.id,
        doctorProfileId: appointment.doctorProfileId,
        score: parsed.data.score,
        comment: parsed.data.comment ?? null,
      },
    });

    // Recomputed from all ratings, not incremented -- avoids any drift
    // between a running average and reality, which incremental math is
    // prone to if a rating is ever edited or removed later.
    const agg = await tx.appointmentRating.aggregate({
      where: { doctorProfileId: appointment.doctorProfileId },
      _avg: { score: true },
      _count: { score: true },
    });

    await tx.doctorProfile.update({
      where: { id: appointment.doctorProfileId },
      data: { ratingAverage: agg._avg.score ?? 0, ratingCount: agg._count.score },
    });
  });

  revalidatePath('/patient/dashboard');
  return { success: true };
}