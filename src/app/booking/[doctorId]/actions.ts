'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';
import { aiGuidanceSchema } from '@/lib/ai/schema';
import { shouldAutoConfirm } from '@/lib/scheduling/policy';

const createAppointmentSchema = z.object({
  doctorProfileId: z.string().uuid(),
  slotStartUtc: z.string().datetime(),
  bookingSubjectType: z.enum(['SELF', 'FAMILY_MEMBER']),
  familyMemberId: z.string().uuid().optional(),
  reasonText: z.string().min(10, 'Please provide a bit more detail.').max(2000),
  aiSummaryJson: z.string().optional(),
});

export async function createAppointment(formData: FormData) {
  const session = await requireRole('PATIENT');
  const patientProfile = await prisma.patientProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  });

  const parsed = createAppointmentSchema.safeParse({
    doctorProfileId: formData.get('doctorProfileId'),
    slotStartUtc: formData.get('slotStartUtc'),
    bookingSubjectType: formData.get('bookingSubjectType'),
    familyMemberId: formData.get('familyMemberId') || undefined,
    reasonText: formData.get('reasonText'),
    aiSummaryJson: formData.get('aiSummaryJson') || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid submission.' };
  }
  const data = parsed.data;

  // A malformed or tampered aiSummaryJson should never block the booking
  // itself -- attaching a summary is optional, so an invalid one is simply
  // dropped rather than surfaced as an error to the patient.
  let validatedAiSummary: unknown = null;
  if (data.aiSummaryJson) {
    try {
      const rawSummary = JSON.parse(data.aiSummaryJson);
      const summaryCheck = aiGuidanceSchema.safeParse(rawSummary);
      if (summaryCheck.success) validatedAiSummary = summaryCheck.data;
    } catch {
      // malformed JSON -- drop it, continue booking normally
    }
  }

  if (data.bookingSubjectType === 'FAMILY_MEMBER') {
    if (!data.familyMemberId) return { error: 'Please select a family member.' };
    const owned = await prisma.familyMember.findFirst({
      where: { id: data.familyMemberId, patientProfileId: patientProfile.id },
    });
    if (!owned) return { error: 'Family member not found on your account.' };
  }

  const doctor = await prisma.doctorProfile.findFirst({
    where: { id: data.doctorProfileId, applicationStatus: 'APPROVED' },
  });
  if (!doctor) return { error: 'This doctor is not currently available for booking.' };

  const startUtc = new Date(data.slotStartUtc);
  const dayOfWeek = startUtc.getUTCDay();
  const template = await prisma.doctorAvailability.findUnique({
    where: { doctorProfileId_dayOfWeek: { doctorProfileId: doctor.id, dayOfWeek } },
  });
  if (!template) return { error: 'This doctor has no availability on the selected day.' };

  const initialStatus = shouldAutoConfirm(startUtc) ? 'CONFIRMED' : 'PENDING';

  let appointmentId: string;
  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientProfileId: patientProfile.id,
        doctorProfileId: doctor.id,
        familyMemberId: data.bookingSubjectType === 'FAMILY_MEMBER' ? data.familyMemberId : null,
        bookingSubjectType: data.bookingSubjectType,
        startUtc,
        durationMinutes: template.sessionDurationMinutes,
        status: initialStatus,
        reason: {
          create: {
            originalText: data.reasonText,
            aiSummaryJson: validatedAiSummary ?? undefined,
            aiSummaryApprovedAt: validatedAiSummary ? new Date() : undefined,
          },
        },
        statusHistory: { create: [{ toStatus: initialStatus, changedByUserId: session.user.id }] },
      },
    });
    appointmentId = appointment.id;
  } catch (e) {
    // ...unchanged
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'This slot was just booked by someone else. Please choose another time.' };
    }
    throw e;
  }

  redirect(`/booking/${doctor.id}/confirmation?appointmentId=${appointmentId}`);
}

const addFamilyMemberSchema = z.object({
  fullName: z.string().min(2).max(100),
  dateOfBirth: z.string().date(),
  relationship: z.string().min(2).max(50),
});

export async function addFamilyMember(formData: FormData) {
  const session = await requireRole('PATIENT');
  const patientProfile = await prisma.patientProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  });

  const parsed = addFamilyMemberSchema.safeParse({
    fullName: formData.get('fullName'),
    dateOfBirth: formData.get('dateOfBirth'),
    relationship: formData.get('relationship'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid family member details.' };
  }

  await prisma.familyMember.create({
    data: {
      patientProfileId: patientProfile.id,
      fullName: parsed.data.fullName,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      relationship: parsed.data.relationship,
    },
  });

  return { success: true };
}