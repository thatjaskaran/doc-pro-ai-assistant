'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';
import { validateAvatarFile } from '@/lib/validation/avatar';
import { cloudinary } from '@/lib/cloudinary';
import { env } from '@/lib/env';

const updateDoctorProfileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(1000).optional(),
  feeRupees: z.coerce.number().int().min(100).max(50000),
  specialtyIds: z.array(z.string().uuid()).min(1, 'Select at least one specialty.'),
});

export async function updateDoctorProfile(formData: FormData) {
  const session = await requireRole('DOCTOR');

  const parsed = updateDoctorProfileSchema.safeParse({
    name: formData.get('name'),
    bio: formData.get('bio') || undefined,
    feeRupees: formData.get('feeRupees'),
    specialtyIds: formData.getAll('specialtyIds'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };

  const doctorProfile = await prisma.doctorProfile.findUniqueOrThrow({ where: { userId: session.user.id } });

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } }),
    prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: {
        bio: parsed.data.bio ?? null,
        feeCents: parsed.data.feeRupees * 100,
        // set (not just connect) fully replaces the specialty list with the
        // submitted one -- without it, unchecking a specialty in the form
        // would silently do nothing, since connect only adds relations.
        specialties: {
          set: [],
          connect: parsed.data.specialtyIds.map((id) => ({ id })),
        },
      },
    }),
  ]);
  // applicationStatus is deliberately absent from both the schema and this
  // update -- only the admin review action (Milestone 6) may change it. A
  // doctor editing their own profile has no path to self-approve.

  revalidatePath('/doctor/profile');
  return { success: true };
}

export async function uploadDoctorAvatar(formData: FormData) {
  const session = await requireRole('DOCTOR');

  if (!env.CLOUDINARY_CLOUD_NAME) {
    return { error: 'Photo uploads are not configured on this server yet.' };
  }

  const file = formData.get('avatar');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Please choose an image file.' };
  }

  const validationError = validateAvatarFile(file);
  if (validationError) return { error: validationError };

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'avatars',
    public_id: session.user.id,
    overwrite: true,
  });

  await prisma.user.update({ where: { id: session.user.id }, data: { image: result.secure_url } });

  revalidatePath('/doctor/profile');
  return { success: true, url: result.secure_url };
}