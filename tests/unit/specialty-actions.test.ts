import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({ requireRole: vi.fn().mockResolvedValue({ user: { id: 'admin-1' } }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    specialty: { findUnique: vi.fn(), delete: vi.fn() },
  },
}));

import { deleteSpecialty } from '@/app/admin/specialties/actions';
import { prisma } from '@/lib/db/prisma';

const validId = '11111111-1111-4111-8111-111111111111';

describe('deleteSpecialty', () => {
  beforeEach(() => vi.clearAllMocks());

  it('blocks deletion when doctors still reference the specialty', async () => {
    vi.mocked(prisma.specialty.findUnique).mockResolvedValue({ id: validId, _count: { doctors: 2 } } as any);
    const fd = new FormData();
    fd.set('specialtyId', validId);
    const result = await deleteSpecialty(fd);
    expect(result?.error).toMatch(/2 doctor/i);
    expect(prisma.specialty.delete).not.toHaveBeenCalled();
  });

  it('allows deletion when no doctors reference the specialty', async () => {
    vi.mocked(prisma.specialty.findUnique).mockResolvedValue({ id: validId, _count: { doctors: 0 } } as any);
    vi.mocked(prisma.specialty.delete).mockResolvedValue({} as any);
    const fd = new FormData();
    fd.set('specialtyId', validId);
    const result = await deleteSpecialty(fd);
    expect(result?.success).toBe(true);
  });
});