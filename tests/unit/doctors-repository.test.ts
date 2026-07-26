import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchDoctors } from '@/lib/doctors/repository';
import { prisma } from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    doctorProfile: { findMany: vi.fn(), count: vi.fn() },
  },
}));

describe('searchDoctors', () => {
  beforeEach(() => vi.clearAllMocks());

  it('always filters to APPROVED doctors, even with no other filters applied', async () => {
    vi.mocked(prisma.doctorProfile.findMany).mockResolvedValue([]);
    vi.mocked(prisma.doctorProfile.count).mockResolvedValue(0);

    await searchDoctors({});

    const whereArg = vi.mocked(prisma.doctorProfile.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toMatchObject({ applicationStatus: 'APPROVED' });
  });

  it('adds a specialty filter when specialtyId is provided', async () => {
    vi.mocked(prisma.doctorProfile.findMany).mockResolvedValue([]);
    vi.mocked(prisma.doctorProfile.count).mockResolvedValue(0);

    await searchDoctors({ specialtyId: 'spec-1' });

    const whereArg = vi.mocked(prisma.doctorProfile.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toMatchObject({ specialties: { some: { id: 'spec-1' } } });
  });
});