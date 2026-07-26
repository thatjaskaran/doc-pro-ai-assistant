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