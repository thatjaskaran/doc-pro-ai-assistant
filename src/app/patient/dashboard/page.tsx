import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { isCancellable } from '@/lib/scheduling/policy';
import { CancelButton } from './cancel-button';
import { HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';
import { HistoryList } from './history-list';

export default async function PatientDashboardPage() {
    let session;
    try {
        session = await requireRole('PATIENT');
    } catch {
        redirect('/sign-in?redirectTo=/patient/dashboard');
    }

    const patientProfile = await prisma.patientProfile.findUniqueOrThrow({
        where: { userId: session.user.id },
    });

    const appointments = await prisma.appointment.findMany({
        where: { patientProfileId: patientProfile.id },
        orderBy: { startUtc: 'desc' },
        select: {
            id: true,
            status: true,
            bookingSubjectType: true,
            doctorProfileId: true,
            startUtc: true,
            doctorProfile: {
                select: {
                    feeCents: true,
                    user: { select: { name: true, image: true } },
                    specialties: { select: { name: true } },
                },
            },
            familyMember: { select: { fullName: true } },
            reason: { select: { originalText: true, aiSummaryJson: true } },
            rating: { select: { score: true, comment: true } },
        },
    });

    const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];
    const upcoming = appointments.filter((a) => !TERMINAL_STATUSES.includes(a.status));
    const history = appointments.filter((a) => TERMINAL_STATUSES.includes(a.status));

    // Convert Date objects to ISO strings for safe client serialization
    const serializedHistory = history.map((a) => ({
        ...a,
        startUtc: a.startUtc.toISOString(),
    }));

    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat('en-IN', { timeZone: HOSPITAL_TIMEZONE, dateStyle: 'medium', timeStyle: 'short' }).format(d);

    const formatCurrency = (amountCents: number) =>
        (amountCents / 100).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        });

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-emerald-50 text-emerald-800 ring-emerald-600/20';
            case 'PENDING':
                return 'bg-amber-50 text-amber-800 ring-amber-600/20';
            case 'COMPLETED':
                return 'bg-teal-50 text-teal-800 ring-teal-600/20';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-800 ring-rose-600/20';
            default:
                return 'bg-slate-50 text-slate-700 ring-slate-600/20';
        }
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
            {/* Header */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                        Patient Dashboard
                    </span>

                    <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                        My Appointments
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        View upcoming appointments, manage bookings, and access your appointment history.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Upcoming Section */}
                <div className="mb-12">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-serif font-bold text-slate-900">
                            Upcoming Appointments
                        </h2>

                        <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold font-mono text-teal-800 ring-1 ring-inset ring-teal-200/60">
                            {upcoming.length} scheduled
                        </span>
                    </div>

                    {upcoming.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/80 p-10 text-center shadow-sm">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-serif text-teal-800 ring-2 ring-teal-100/60">
                                📅
                            </div>

                            <h3 className="mt-4 text-lg font-serif font-bold text-slate-900">
                                No upcoming appointments
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Schedule your next consultation with one of our specialists.
                            </p>

                            <Link
                                href="/doctors"
                                className="mt-5 inline-flex rounded-2xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 active:scale-95"
                            >
                                Find Doctors
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcoming.map((a) => (
                                <article
                                    key={a.id}
                                    className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ring-1 ring-inset ${getStatusBadgeStyle(
                                                        a.status
                                                    )}`}
                                                >
                                                    {a.status}
                                                </span>

                                                <span className="inline-flex items-center rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-semibold font-mono text-slate-600">
                                                    For: {a.bookingSubjectType === 'SELF' ? 'You' : a.familyMember?.fullName}
                                                </span>
                                            </div>

                                            {/* Doctor Information */}
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                                                    {a.doctorProfile.user.image ? (
                                                        <Image
                                                            src={a.doctorProfile.user.image}
                                                            alt={a.doctorProfile.user.name ?? ''}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center font-bold font-serif text-teal-800 bg-teal-50">
                                                            {a.doctorProfile.user.name?.charAt(0) ?? 'D'}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-serif font-bold text-slate-900 leading-tight">
                                                        {a.doctorProfile.user.name}
                                                    </h3>
                                                    {a.doctorProfile.specialties?.length > 0 && (
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                            {a.doctorProfile.specialties.map((s) => s.name).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1 text-xs">
                                                <p className="font-mono text-slate-600" suppressHydrationWarning>
                                                    🗓️ {formatDate(a.startUtc)}
                                                </p>
                                                <p className="font-semibold text-slate-700">
                                                    Fee: {formatCurrency(a.doctorProfile.feeCents)}
                                                </p>
                                            </div>

                                            {a.reason?.originalText && (
                                                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                                    <span className="font-semibold text-slate-700">Reason:</span> {a.reason.originalText}
                                                </p>
                                            )}

                                            {a.reason?.aiSummaryJson && (
                                                <details className="mt-3 rounded-2xl border border-teal-200/80 bg-teal-50/40 p-3 text-xs text-slate-700">
                                                    <summary className="cursor-pointer font-semibold text-teal-800 select-none hover:underline">
                                                        📋 AI-generated summary you attached
                                                    </summary>
                                                    <div className="mt-2.5 space-y-1.5 border-t border-teal-100 pt-2.5">
                                                        <p>
                                                            <strong>Suggested specialty:</strong>{' '}
                                                            {(a.reason.aiSummaryJson as any).suggestedSpecialty}
                                                        </p>
                                                        <p className="leading-relaxed">
                                                            {(a.reason.aiSummaryJson as any).patientEducationSummary}
                                                        </p>
                                                        {(a.reason.aiSummaryJson as any).urgencyNote && (
                                                            <p className="text-[11px] text-amber-800 font-medium italic">
                                                                {(a.reason.aiSummaryJson as any).urgencyNote}
                                                            </p>
                                                        )}
                                                    </div>
                                                </details>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-start gap-3 lg:items-end">
                                            {(a.status === 'PENDING' || a.status === 'CONFIRMED') &&
                                                (isCancellable(a.startUtc) ? (
                                                    <CancelButton appointmentId={a.id} />
                                                ) : (
                                                    <p className="text-xs font-mono text-slate-500 italic">
                                                        Cancellation window has passed.
                                                    </p>
                                                ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                {/* History Section */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-serif font-bold text-slate-900">
                            Appointment History
                        </h2>

                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold font-mono text-slate-700">
                            {history.length} record{history.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    <HistoryList history={serializedHistory} />
                </div>

                {/* Navigation Actions */}
                <div className="mt-10 flex justify-end">
                    <Link
                        href="/patient/profile"
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                    >
                        Edit Profile
                    </Link>
                </div>
            </section>
        </main>
    );
}