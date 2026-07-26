import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({ requireRole: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    patientProfile: { findUniqueOrThrow: vi.fn() },
    appointment: { findFirst: vi.fn() },
    appointmentRating: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { submitRating } from '@/app/patient/dashboard/actions';
import { prisma } from '@/lib/db/prisma';

const validId = '11111111-1111-4111-8111-111111111111';
function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe('submitRating', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects rating an appointment that is not COMPLETED', async () => {
    vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue({ id: validId, doctorProfileId: 'doc-1', status: 'CONFIRMED' } as any);

    const result = await submitRating(formData({ appointmentId: validId, score: '5' }));
    expect(result?.error).toMatch(/only rate completed/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects rating the same appointment twice', async () => {
    vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue({ id: validId, doctorProfileId: 'doc-1', status: 'COMPLETED' } as any);
    vi.mocked(prisma.appointmentRating.findUnique).mockResolvedValue({ id: 'existing-rating' } as any);

    const result = await submitRating(formData({ appointmentId: validId, score: '4' }));
    expect(result?.error).toMatch(/already rated/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a score outside 1-5', async () => {
    const result = await submitRating(formData({ appointmentId: validId, score: '7' }));
    expect(result?.error).toBeDefined();
  });
});