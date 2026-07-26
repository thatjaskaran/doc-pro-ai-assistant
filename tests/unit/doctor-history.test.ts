import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db/prisma', () => ({
  prisma: { appointment: { findMany: vi.fn() } },
}));

import { getDoctorHistory } from '@/lib/doctor-dashboard/repository';
import { prisma } from '@/lib/db/prisma';

describe('getDoctorHistory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('always restricts to terminal statuses, never PENDING/CONFIRMED', async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);
    await getDoctorHistory('doctor-1', 'week');
    const whereArg = vi.mocked(prisma.appointment.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toMatchObject({ status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } });
  });

  it('applies no lower time bound when range is "all"', async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);
    await getDoctorHistory('doctor-1', 'all');
    const whereArg = vi.mocked(prisma.appointment.findMany).mock.calls[0][0]?.where;
    expect(whereArg).not.toHaveProperty('startUtc');
  });

  it('applies a startUtc lower bound for "day"', async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);
    await getDoctorHistory('doctor-1', 'day');
    const whereArg = vi.mocked(prisma.appointment.findMany).mock.calls[0][0]?.where;
    expect(whereArg).toHaveProperty('startUtc');
  });
});