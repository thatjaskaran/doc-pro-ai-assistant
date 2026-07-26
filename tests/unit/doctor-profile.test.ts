import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({ requireRole: vi.fn().mockResolvedValue({ user: { id: 'doctor-user-1' } }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/env', () => ({ env: { CLOUDINARY_CLOUD_NAME: 'test' } }));
vi.mock('@/lib/cloudinary', () => ({ cloudinary: { uploader: { upload: vi.fn() } } }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: { update: vi.fn() },
    doctorProfile: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { updateDoctorProfile } from '@/app/doctor/profile/actions';
import { prisma } from '@/lib/db/prisma';

const specId = '11111111-1111-4111-8111-111111111111';

function formData(fields: Record<string, string | string[]>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (Array.isArray(v)) v.forEach((val) => fd.append(k, val));
    else fd.set(k, v);
  }
  return fd;
}

describe('updateDoctorProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects when no specialty is selected', async () => {
    vi.mocked(prisma.doctorProfile.findUniqueOrThrow).mockResolvedValue({ id: 'profile-1' } as any);
    const result = await updateDoctorProfile(formData({
      name: 'Dr. Test', feeRupees: '1000', specialtyIds: [],
    }));
    expect(result?.error).toMatch(/select at least one specialty/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('never includes applicationStatus in the update payload, even if a client injects it', async () => {
    vi.mocked(prisma.doctorProfile.findUniqueOrThrow).mockResolvedValue({ id: 'profile-1' } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (ops: any) => Promise.all(ops));
    const fd = formData({ name: 'Dr. Test', feeRupees: '1000', specialtyIds: [specId] });
    fd.set('applicationStatus', 'APPROVED');
    await updateDoctorProfile(fd);

    const doctorUpdateCall = vi.mocked(prisma.doctorProfile.update).mock.calls[0][0] as any;
    expect(doctorUpdateCall.data).not.toHaveProperty('applicationStatus');
  });
});