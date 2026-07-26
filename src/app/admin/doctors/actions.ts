'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';

const reviewSchema = z.object({
  doctorProfileId: z.string().uuid(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().max(1000).optional(),
});

export async function reviewDoctorApplication(formData: FormData) {
  const session = await requireRole('ADMIN');

  const parsed = reviewSchema.safeParse({
    doctorProfileId: formData.get('doctorProfileId'),
    decision: formData.get('decision'),
    reviewNote: formData.get('reviewNote') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid request.' };

  const doctor = await prisma.doctorProfile.findUnique({ where: { id: parsed.data.doctorProfileId } });
  if (!doctor) return { error: 'Doctor not found.' };
  if (doctor.applicationStatus === parsed.data.decision) {
    return { error: `This doctor is already ${parsed.data.decision.toLowerCase()}.` };
  }

  await prisma.doctorProfile.update({
    where: { id: doctor.id },
    data: {
      applicationStatus: parsed.data.decision,
      reviewedByUserId: session.user.id,
      reviewedAt: new Date(),
      reviewNote: parsed.data.reviewNote ?? null,
    },
  });

  revalidatePath('/admin/doctors');
  return { success: true };
}