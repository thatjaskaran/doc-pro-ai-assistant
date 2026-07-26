import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';
import { computeSlotsForDate, HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';
import { fromZonedTime } from 'date-fns-tz';

export async function getSlotsForDoctorOnDate(doctorProfileId: string, dateStr: string) {
  const localDayStart = fromZonedTime(`${dateStr}T00:00:00`, HOSPITAL_TIMEZONE);
  const localDayEnd = fromZonedTime(`${dateStr}T23:59:59.999`, HOSPITAL_TIMEZONE);
  const dayOfWeek = fromZonedTime(`${dateStr}T12:00:00`, HOSPITAL_TIMEZONE).getUTCDay(); // noon avoids any DST-adjacent edge case

  const template = await prisma.doctorAvailability.findUnique({
    where: { doctorProfileId_dayOfWeek: { doctorProfileId, dayOfWeek } },
  });
  if (!template) return [];

  const booked = await prisma.appointment.findMany({
    where: {
      doctorProfileId,
      startUtc: { gte: localDayStart, lte: localDayEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    select: { startUtc: true },
  });

  return computeSlotsForDate(dateStr, template, new Set(booked.map((a) => a.startUtc.getTime())));
}

export interface DoctorSearchParams {
  specialtyId?: string;
  query?: string;
  sort?: 'rating' | 'fee_asc' | 'fee_desc';
  page?: number;
}

const PAGE_SIZE = 12;

export async function searchDoctors(params: DoctorSearchParams) {
  const { specialtyId, query, sort = 'rating', page = 1 } = params;

  // applicationStatus: 'APPROVED' is not optional here — this is the one
  // line standing between a doctor whose application hasn't been reviewed
  // and them appearing in public search. Test this explicitly, not just
  // implicitly via "the list looks right."
  const where: Prisma.DoctorProfileWhereInput = {
    applicationStatus: 'APPROVED',
    ...(specialtyId ? { specialties: { some: { id: specialtyId } } } : {}),
    ...(query ? { user: { name: { contains: query, mode: 'insensitive' } } } : {}),
  };

  const orderBy: Prisma.DoctorProfileOrderByWithRelationInput =
    sort === 'fee_asc' ? { feeCents: 'asc' }
    : sort === 'fee_desc' ? { feeCents: 'desc' }
    : { ratingAverage: 'desc' };

  const [doctors, total] = await Promise.all([
    prisma.doctorProfile.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        bio: true,
        feeCents: true,
        ratingAverage: true,
        ratingCount: true,
        user: { select: { name: true, image: true } },
        specialties: { select: { id: true, name: true } },
      },
    }),
    prisma.doctorProfile.count({ where }),
  ]);

  return { doctors, total, page, pageCount: Math.ceil(total / PAGE_SIZE) };
}

export async function getDoctorById(id: string) {
  // Same guard as above, applied to the detail page too — without it, a
  // guest could reach a pending doctor's profile directly by guessing/
  // enumerating IDs, bypassing the list-level filter entirely.
  return prisma.doctorProfile.findFirst({
    where: { id, applicationStatus: 'APPROVED' },
    select: {
      id: true,
      bio: true,
      feeCents: true,
      ratingAverage: true,
      ratingCount: true,
      user: { select: { name: true, image: true } },
      specialties: { select: { id: true, name: true } },
      availability: {
        orderBy: { dayOfWeek: 'asc' },
        select: {
          dayOfWeek: true, workStart: true, workEnd: true,
          breakStart: true, breakEnd: true, sessionDurationMinutes: true,
        },
      },
    },
  });
}

export async function listSpecialties() {
  return prisma.specialty.findMany({ orderBy: { name: 'asc' } });
}