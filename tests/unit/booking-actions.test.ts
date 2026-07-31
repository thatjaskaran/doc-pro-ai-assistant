import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';

vi.mock('@/lib/auth/session', () => ({
    requireRole: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}));
vi.mock('@/lib/db/prisma', () => ({
    prisma: {
        patientProfile: { findUniqueOrThrow: vi.fn() },
        familyMember: { findFirst: vi.fn() },
        doctorProfile: { findFirst: vi.fn() },
        doctorAvailability: { findUnique: vi.fn() },
        appointment: { create: vi.fn() },
    },
}));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import { createAppointment } from '@/app/booking/[doctorId]/actions';
import { prisma } from '@/lib/db/prisma';

function formData(fields: Record<string, string>) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    return fd;
}

describe('createAppointment', () => {
    beforeEach(() => vi.clearAllMocks());

    it('returns a friendly error, not a crash, when the slot is already taken', async () => {
        vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
        vi.mocked(prisma.doctorProfile.findFirst).mockResolvedValue({ id: 'doctor-1' } as any);
        vi.mocked(prisma.doctorAvailability.findUnique).mockResolvedValue({ sessionDurationMinutes: 30 } as any);
        vi.mocked(prisma.appointment.create).mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002', clientVersion: '7.8.0',
            }),
        );

        const result = await createAppointment(formData({
            doctorProfileId: '11111111-1111-4111-8111-111111111111',
            slotStartUtc: '2026-07-20T09:00:00.000Z',
            bookingSubjectType: 'SELF',
            reasonText: 'Recurring headaches for the past two weeks.',
        }));

        expect(result?.error).toMatch(/just booked by someone else/i);
    });

    it('rejects a familyMemberId not owned by the requesting patient', async () => {
        vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
        vi.mocked(prisma.familyMember.findFirst).mockResolvedValue(null); // not owned / doesn't exist

        const result = await createAppointment(formData({
            doctorProfileId: '11111111-1111-4111-8111-111111111111',
            slotStartUtc: '2026-07-20T09:00:00.000Z',
            bookingSubjectType: 'FAMILY_MEMBER',
            familyMemberId: '22222222-2222-4222-8222-222222222222',
            reasonText: 'Follow-up for a reported fever.',
        }));

        expect(result?.error).toMatch(/not found on your account/i);
    });
    it('drops a malformed aiSummaryJson rather than failing the whole booking', async () => {
        vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
        vi.mocked(prisma.doctorProfile.findFirst).mockResolvedValue({ id: 'doctor-1' } as any);
        vi.mocked(prisma.doctorAvailability.findUnique).mockResolvedValue({ sessionDurationMinutes: 30 } as any);
        vi.mocked(prisma.appointment.create).mockResolvedValue({ id: 'appt-1' } as any);

        await createAppointment(formData({
            doctorProfileId: '11111111-1111-4111-8111-111111111111',
            slotStartUtc: '2026-07-20T09:00:00.000Z',
            bookingSubjectType: 'SELF',
            reasonText: 'Recurring headaches for the past two weeks.',
            aiSummaryJson: '{"garbage": true}', // valid JSON, wrong shape
        }));

        const createCall = vi.mocked(prisma.appointment.create).mock.calls[0][0] as any;
        expect(createCall.data.reason.create.aiSummaryJson).toBeUndefined();
    });
    it('creates a PENDING appointment when the slot is beyond the auto-confirm window', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-07-20T00:00:00Z'));

        vi.mocked(prisma.patientProfile.findUniqueOrThrow).mockResolvedValue({ id: 'patient-1' } as any);
        vi.mocked(prisma.doctorProfile.findFirst).mockResolvedValue({ id: 'doctor-1' } as any);
        vi.mocked(prisma.doctorAvailability.findUnique).mockResolvedValue({ sessionDurationMinutes: 30 } as any);
        vi.mocked(prisma.appointment.create).mockResolvedValue({ id: 'appt-1' } as any);

        await createAppointment(formData({
            doctorProfileId: '11111111-1111-4111-8111-111111111111',
            slotStartUtc: '2026-08-15T09:00:00.000Z', // ~26 days out from the frozen "now"
            bookingSubjectType: 'SELF',
            reasonText: 'Routine follow-up scheduled well in advance.',
        }));

        const createCall = vi.mocked(prisma.appointment.create).mock.calls[0][0] as any;
        expect(createCall.data.status).toBe('PENDING');

        vi.useRealTimers();
    });
});