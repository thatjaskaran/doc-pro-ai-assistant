'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';

const createSpecialtySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export async function createSpecialty(formData: FormData) {
  await requireRole('ADMIN');
  const parsed = createSpecialtySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };

  const existing = await prisma.specialty.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { error: 'A specialty with this name already exists.' };

  await prisma.specialty.create({ data: parsed.data });
  revalidatePath('/admin/specialties');
  return { success: true };
}

const deleteSpecialtySchema = z.object({ specialtyId: z.string().uuid() });

export async function deleteSpecialty(formData: FormData) {
  await requireRole('ADMIN');
  const parsed = deleteSpecialtySchema.safeParse({ specialtyId: formData.get('specialtyId') });
  if (!parsed.success) return { error: 'Invalid request.' };

  const specialty = await prisma.specialty.findUnique({
    where: { id: parsed.data.specialtyId },
    include: { _count: { select: { doctors: true } } },
  });
  if (!specialty) return { error: 'Specialty not found.' };
  if (specialty._count.doctors > 0) {
    return { error: `Cannot delete: ${specialty._count.doctors} doctor(s) still reference this specialty. Reassign them first.` };
  }

  await prisma.specialty.delete({ where: { id: specialty.id } });
  revalidatePath('/admin/specialties');
  return { success: true };
}