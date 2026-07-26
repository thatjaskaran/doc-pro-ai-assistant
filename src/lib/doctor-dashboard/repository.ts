import { prisma } from '@/lib/db/prisma';

export type HistoryRange = 'day' | 'week' | 'month' | 'all';

const RANGE_DAYS: Record<Exclude<HistoryRange, 'all'>, number> = {
  day: 1,
  week: 7,
  month: 30,
};

// History is defined as appointments that reached a terminal status
// (COMPLETED/CANCELLED/NO_SHOW), not "anything in the past" -- a PENDING
// appointment whose slot time has quietly passed without the doctor acting
// on it is a data-quality problem worth surfacing separately later, not
// something that should silently blend into "history" as if it were normal.
export async function getDoctorHistory(doctorProfileId: string, range: HistoryRange) {
  const since = range === 'all' ? undefined : new Date(Date.now() - RANGE_DAYS[range] * 24 * 60 * 60 * 1000);

  return prisma.appointment.findMany({
    where: {
      doctorProfileId,
      status: { in: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
      ...(since ? { startUtc: { gte: since } } : {}),
    },
    orderBy: { startUtc: 'desc' },
    include: {
      patientProfile: { include: { user: { select: { name: true } } } },
      familyMember: true,
      reason: true,
    },
  });
}

export async function getDoctorAnalyticsSummary(doctorProfileId: string) {
  const grouped = await prisma.appointment.groupBy({
    by: ['status'],
    where: { doctorProfileId },
    _count: { _all: true },
  });
  return Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Record<string, number>;
}