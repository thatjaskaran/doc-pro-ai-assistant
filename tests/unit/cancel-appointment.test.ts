import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  requireRole: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    patientProfile: { findUniqueOrThrow: vi.fn() },
    appointment: { findFirst: vi.fn(), update: vi.fn() },
    appointmentStatusHistory: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { cancelAppointment } from '@/app/patient/dashboard/actions';
import { prisma } from '@/lib/db/prisma';

function formData(appointmentId: string) {
  const fd = new FormData();
  fd.set('appointmentId', appointmentId);
  return fd;
}

const validId = '11111111-1111-4111-8111-111111111111';

describe('cancelAppointment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects cancelling an appointment that does not belong to the caller', async () => {
    vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue(null);

    const result = await cancelAppointment(formData(validId));
    expect(result?.error).toMatch(/not found/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects cancelling inside the 2-hour policy window', async () => {
    vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
    const soon = new Date(Date.now() + 30 * 60 * 1000);
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue({
      id: validId, status: 'CONFIRMED', startUtc: soon,
    } as any);

    const result = await cancelAppointment(formData(validId));
    expect(result?.error).toMatch(/2 hours/i);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('allows cancelling outside the policy window and writes both the status update and history row', async () => {
    vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
    const later = new Date(Date.now() + 5 * 60 * 60 * 1000);
    vi.mocked(prisma.appointment.findFirst).mockResolvedValue({
      id: validId, status: 'CONFIRMED', startUtc: later,
    } as any);
    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

    const result = await cancelAppointment(formData(validId));
    expect(result?.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});