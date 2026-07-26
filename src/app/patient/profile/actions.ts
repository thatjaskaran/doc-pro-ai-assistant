'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { cloudinary } from '@/lib/cloudinary';
import { validateAvatarFile } from '@/lib/validation/avatar';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[+\d][\d\s-]{7,20}$/, 'Enter a valid phone number').optional().or(z.literal('')),
});

export async function updateProfile(formData: FormData) {
  const session = await requireRole('PATIENT');

  const parsed = updateProfileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };

  await prisma.$transaction([
    prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } }),
    prisma.patientProfile.update({
      where: { userId: session.user.id },
      data: { phone: parsed.data.phone || null },
    }),
  ]);

  revalidatePath('/patient/profile');
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const session = await requireRole('PATIENT');

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

  revalidatePath('/patient/profile');
  return { success: true, url: result.secure_url };
}