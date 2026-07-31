import { prisma } from '@/lib/db/prisma';

export async function getAllDoctorsForReview() {
  return prisma.doctorProfile.findMany({
    orderBy: [{ applicationStatus: 'asc' }, { createdAt: 'desc' }],
    include: {
      user: { select: { name: true, email: true } },
      specialties: { select: { id: true, name: true } },
    },
  });
}

export async function getSpecialtiesWithDoctorCount() {
  return prisma.specialty.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { doctors: true } } },
  });
}

export async function getAnalyticsSummary() {
  const [
    totalPatients,
    totalApprovedDoctors,
    totalPendingDoctors,
    appointmentsByStatus,
    totalRevenueCentsResult,
  ] = await Promise.all([
    prisma.patientProfile.count(),
    prisma.doctorProfile.count({ where: { applicationStatus: 'APPROVED' } }),
    prisma.doctorProfile.count({ where: { applicationStatus: 'PENDING' } }),
    prisma.appointment.groupBy({ by: ['status'], _count: { _all: true } }),
    // Revenue is an estimate from completed appointments' doctor fee at
    // query time, not a snapshot of what the fee was when each appointment
    // happened -- fine for a demo dashboard, but flag this as an estimate,
    // not an accounting-grade figure, if this ever needs to be accurate.
    prisma.appointment.findMany({
      where: { status: 'COMPLETED' },
      select: { doctorProfile: { select: { feeCents: true } } },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    appointmentsByStatus.map((row) => [row.status, row._count._all]),
  );
  const estimatedRevenueCents = totalRevenueCentsResult.reduce(
    (sum, a) => sum + a.doctorProfile.feeCents, 0,
  );

  return { totalPatients, totalApprovedDoctors, totalPendingDoctors, statusCounts, estimatedRevenueCents };
}

export interface AdminDoctorSearchParams {
  query?: string;
  specialtyId?: string;
}

export async function searchDoctorsForAdmin(params: AdminDoctorSearchParams) {
  const { query, specialtyId } = params;

  // Deliberately no applicationStatus filter here -- unlike the public
  // directory (searchDoctors, Milestone 2), admin needs to see EVERY
  // doctor regardless of status, including pending and rejected ones.
  const doctors = await prisma.doctorProfile.findMany({
    where: {
      ...(specialtyId ? { specialties: { some: { id: specialtyId } } } : {}),
      ...(query ? { user: { name: { contains: query, mode: 'insensitive' } } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, image: true } },
      specialties: { select: { id: true, name: true } },
    },
  });

  // One grouped query for all matched doctors' status breakdowns, instead
  // of N+1 per-doctor queries.
  const grouped = await prisma.appointment.groupBy({
    by: ['doctorProfileId', 'status'],
    where: { doctorProfileId: { in: doctors.map((d) => d.id) } },
    _count: { _all: true },
  });

  const statusByDoctor = new Map<string, Record<string, number>>();
  for (const row of grouped) {
    const existing = statusByDoctor.get(row.doctorProfileId) ?? {};
    existing[row.status] = row._count._all;
    statusByDoctor.set(row.doctorProfileId, existing);
  }

  return doctors.map((d) => ({ ...d, appointmentCounts: statusByDoctor.get(d.id) ?? {} }));
}

export async function getDoctorPerformanceDetail(doctorProfileId: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorProfileId },
    include: {
      user: { select: { name: true, email: true, image: true } },
      specialties: { select: { name: true } },
    },
  });
  if (!doctor) return null;

  const appointments = await prisma.appointment.findMany({
    where: { doctorProfileId },
    orderBy: { startUtc: 'desc' },
    take: 50, // capped -- oversight doesn't require an unbounded history
    include: {
      patientProfile: { include: { user: { select: { name: true } } } },
      familyMember: true,
      rating: true,
      // reason intentionally NOT included -- see privacy note above
    },
  });

  return { doctor, appointments };
}