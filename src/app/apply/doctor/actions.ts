'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { createNonPatientUser } from '@/lib/auth/provision';

const applySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().min(20, 'Please write at least a couple of sentences.').max(1000),
  feeRupees: z.coerce.number().int().min(100).max(50000),
  specialtyIds: z.array(z.string().uuid()).min(1, 'Select at least one specialty.'),
});

export async function applyAsDoctor(formData: FormData) {
  const parsed = applySchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    bio: formData.get('bio'),
    feeRupees: formData.get('feeRupees'),
    specialtyIds: formData.getAll('specialtyIds'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid application.' };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: 'An account with this email already exists.' };

  const user = await createNonPatientUser(parsed.data.email, parsed.data.password, parsed.data.name, 'DOCTOR');

  await prisma.doctorProfile.create({
    data: {
      userId: user.id,
      bio: parsed.data.bio,
      feeCents: parsed.data.feeRupees * 100,
      applicationStatus: 'PENDING', // always PENDING at submission -- only an admin (Milestone 6's review flow) can change this
      specialties: { connect: parsed.data.specialtyIds.map((id) => ({ id })) },
    },
  });

  // signUpEmail (inside createNonPatientUser) already establishes a session
  // via the nextCookies plugin -- the applicant is signed in immediately.
  // /doctor/dashboard already renders the "Application Under Review"
  // message for PENDING doctors (built in Milestone 5), so it's reused
  // directly rather than building a separate confirmation page.
  redirect('/doctor/dashboard');
}