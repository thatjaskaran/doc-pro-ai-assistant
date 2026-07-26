import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';
import { getDoctorHistory, getDoctorAnalyticsSummary, type HistoryRange } from '@/lib/doctor-dashboard/repository';
import { DoctorDashboardTabs } from './DoctorDashboardTabs';

interface DoctorDashboardPageProps {
    searchParams: Promise<{ range?: string }>;
}

const VALID_RANGES: HistoryRange[] = ['day', 'week', 'month', 'all'];

const STATUS_VARIANTS: Record<string, { label: string; badge: string }> = {
    PENDING: { label: 'Pending', badge: 'bg-amber-50 text-amber-900 border-amber-200/80' },
    CONFIRMED: { label: 'Confirmed', badge: 'bg-teal-50 text-teal-900 border-teal-200/80' },
    COMPLETED: { label: 'Completed', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
    CANCELLED: { label: 'Cancelled', badge: 'bg-rose-50 text-rose-900 border-rose-200/80' },
    NO_SHOW: { label: 'No Show', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default async function DoctorDashboardPage({ searchParams }: DoctorDashboardPageProps) {
    let session;
    try {
        session = await requireRole('DOCTOR');
    } catch {
        redirect('/sign-in?redirectTo=/doctor/dashboard');
    }

    const doctorProfile = await prisma.doctorProfile.findUniqueOrThrow({
        where: { userId: session.user.id },
    });

    if (doctorProfile.applicationStatus !== 'APPROVED') {
        return (
            <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-12">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-slate-900">
                        Application Under Review
                    </h1>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                        {doctorProfile.applicationStatus === 'PENDING'
                            ? "Your application is still being reviewed by an administrator. You'll be able to manage appointments once approved."
                            : 'Your application was not approved. Please contact the hospital administrator for details.'}
                    </p>
                </div>
            </main>
        );
    }

    const { range: rawRange } = await searchParams;
    const range: HistoryRange = VALID_RANGES.includes(rawRange as HistoryRange) ? (rawRange as HistoryRange) : 'week';

    const [upcoming, history, statusCounts] = await Promise.all([
        prisma.appointment.findMany({
            where: { doctorProfileId: doctorProfile.id, status: { in: ['PENDING', 'CONFIRMED'] } },
            orderBy: { startUtc: 'asc' },
            include: {
                patientProfile: { include: { user: { select: { name: true } } } },
                familyMember: true,
                reason: true,
            },
        }),
        getDoctorHistory(doctorProfile.id, range),
        getDoctorAnalyticsSummary(doctorProfile.id),
    ]);

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white px-4 py-10 text-slate-900 selection:bg-teal-600 selection:text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                
                {/* Header & Quick Action */}
                <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 mb-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                            Practitioner Portal
                        </div>
                        <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Doctor Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Manage patient appointments, status updates, and working availability.
                        </p>
                    </div>

                    <a
                        href="/doctor/availability"
                        className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-95 font-mono"
                    >
                        Manage Availability
                    </a>
                </div>

                {/* Status Overview Banner */}
                <section className="space-y-3">
                    <h2 className="font-serif text-lg font-bold text-slate-900">Overview</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((s) => {
                            const variant = STATUS_VARIANTS[s];
                            return (
                                <div
                                    key={s}
                                    className={`rounded-2xl border p-4 shadow-sm transition ${variant.badge}`}
                                >
                                    <span className="block font-mono text-[11px] font-semibold uppercase tracking-wider opacity-75">
                                        {variant.label}
                                    </span>
                                    <span className="mt-1 block font-serif text-2xl font-bold">
                                        {statusCounts[s] ?? 0}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Tab Navigation & Content */}
                <DoctorDashboardTabs
                    upcoming={upcoming}
                    history={history}
                    timeZone={HOSPITAL_TIMEZONE}
                />

            </div>
        </main>
    );
}