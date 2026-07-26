import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({ requireRole: vi.fn().mockResolvedValue({ user: { id: 'admin-1' } }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: { doctorProfile: { findUnique: vi.fn(), update: vi.fn() } },
}));

import { reviewDoctorApplication } from '@/app/admin/doctors/actions';
import { prisma } from '@/lib/db/prisma';

const validId = '11111111-1111-4111-8111-111111111111';
function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe('reviewDoctorApplication', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects re-applying the same decision the doctor already has', async () => {
    vi.mocked(prisma.doctorProfile.findUnique).mockResolvedValue({ id: validId, applicationStatus: 'APPROVED' } as any);
    const result = await reviewDoctorApplication(formData({ doctorProfileId: validId, decision: 'APPROVED' }));
    expect(result?.error).toMatch(/already approved/i);
    expect(prisma.doctorProfile.update).not.toHaveBeenCalled();
  });

  it('allows revoking an already-approved doctor to REJECTED', async () => {
    vi.mocked(prisma.doctorProfile.findUnique).mockResolvedValue({ id: validId, applicationStatus: 'APPROVED' } as any);
    vi.mocked(prisma.doctorProfile.update).mockResolvedValue({} as any);
    const result = await reviewDoctorApplication(formData({ doctorProfileId: validId, decision: 'REJECTED', reviewNote: 'License issue' }));
    expect(result?.success).toBe(true);
    expect(prisma.doctorProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ applicationStatus: 'REJECTED' }) }),
    );
  });
});