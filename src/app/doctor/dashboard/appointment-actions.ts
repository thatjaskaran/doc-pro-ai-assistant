'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';
import { isValidStatusTransition, type AppointmentStatusValue } from '@/lib/scheduling/status-transitions';

const updateStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  newStatus: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

export async function updateAppointmentStatus(formData: FormData) {
  const session = await requireRole('DOCTOR');
  const parsed = updateStatusSchema.safeParse({
    appointmentId: formData.get('appointmentId'),
    newStatus: formData.get('newStatus'),
  });
  if (!parsed.success) return { error: 'Invalid request.' };

  const doctorProfile = await prisma.doctorProfile.findUniqueOrThrow({ where: { userId: session.user.id } });

  // Ownership check -- without scoping to this doctor's own doctorProfileId,
  // any doctor could update the status of any other doctor's appointment
  // just by knowing/guessing its ID.
  const appointment = await prisma.appointment.findFirst({
    where: { id: parsed.data.appointmentId, doctorProfileId: doctorProfile.id },
  });
  if (!appointment) return { error: 'Appointment not found.' };

  if (!isValidStatusTransition(appointment.status as AppointmentStatusValue, parsed.data.newStatus)) {
    return { error: `Cannot change status from ${appointment.status} to ${parsed.data.newStatus}.` };
  }

  await prisma.$transaction([
    prisma.appointment.update({ where: { id: appointment.id }, data: { status: parsed.data.newStatus } }),
    prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: appointment.id,
        fromStatus: appointment.status,
        toStatus: parsed.data.newStatus,
        changedByUserId: session.user.id,
      },
    }),
  ]);

  revalidatePath('/doctor/dashboard');
  return { success: true };
}