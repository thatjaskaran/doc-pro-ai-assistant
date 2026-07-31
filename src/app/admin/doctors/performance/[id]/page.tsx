import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth/session';
import { getDoctorPerformanceDetail } from '@/lib/admin/repository';
import { HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DoctorPerformanceDetailPage({ params }: PageProps) {
    try {
        await requireRole('ADMIN');
    } catch {
        redirect('/sign-in?redirectTo=/admin/doctors/performance');
    }

    const { id } = await params;
    const data = await getDoctorPerformanceDetail(id);
    if (!data) notFound();
    const { doctor, appointments } = data;

    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat('en-IN', {
            timeZone: HOSPITAL_TIMEZONE,
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(d);

    const formatCurrency = (amountCents: number) =>
        (amountCents / 100).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        });

    const getAppStatusBadgeStyle = (status: string) => {
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

    const getDoctorStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-emerald-50 text-emerald-800 ring-emerald-600/20';
            case 'PENDING':
                return 'bg-amber-50 text-amber-800 ring-amber-600/20';
            case 'REJECTED':
                return 'bg-rose-50 text-rose-800 ring-rose-600/20';
            default:
                return 'bg-slate-50 text-slate-700 ring-slate-600/20';
        }
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
            {/* Header / Breadcrumb */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link
                        href="/admin/doctors/performance"
                        className="inline-flex items-center text-xs font-semibold text-teal-800 transition hover:underline"
                    >
                        &larr; Back to Doctor Performance
                    </Link>

                    {/* Doctor Profile Banner */}
                    <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm">
                                {doctor.user.image ? (
                                    <Image
                                        src={doctor.user.image}
                                        alt={doctor.user.name ?? ''}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center font-bold font-serif text-teal-800 bg-teal-50 text-xl">
                                        {doctor.user.name?.charAt(0) ?? 'D'}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-serif font-bold tracking-tight text-slate-900 sm:text-3xl">
                                        {doctor.user.name}
                                    </h1>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ring-1 ring-inset ${getDoctorStatusBadgeStyle(
                                            doctor.applicationStatus
                                        )}`}
                                    >
                                        {doctor.applicationStatus}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500">{doctor.user.email}</p>

                                {doctor.specialties?.length > 0 && (
                                    <p className="text-xs font-medium text-teal-800">
                                        {doctor.specialties.map((s) => s.name).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Performance Quick Summary */}
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm text-xs font-mono">
                            <div className="border-r border-slate-100 pr-4">
                                <span className="block text-slate-400 text-[10px] uppercase font-semibold">
                                    Rating
                                </span>
                                <span className="font-bold text-amber-600">
                                    {doctor.ratingCount > 0
                                        ? `★ ${Number(doctor.ratingAverage).toFixed(1)} (${doctor.ratingCount})`
                                        : 'No ratings'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-[10px] uppercase font-semibold">
                                    Consultation Fee
                                </span>
                                <span className="font-bold text-slate-800">
                                    {formatCurrency(doctor.feeCents)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Appointment History List */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-slate-900">
                            Recent Appointments
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Showing last {appointments.length} appointment records
                        </p>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold font-mono text-slate-700">
                        {appointments.length} logged
                    </span>
                </div>

                {appointments.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/80 p-10 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-serif text-teal-800 ring-2 ring-teal-100/60">
                            🗓️
                        </div>
                        <h3 className="mt-4 text-lg font-serif font-bold text-slate-900">
                            No appointments yet
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            This doctor has not conducted or scheduled any patient consultations.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((a) => (
                            <article
                                key={a.id}
                                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ring-1 ring-inset ${getAppStatusBadgeStyle(
                                                    a.status
                                                )}`}
                                            >
                                                {a.status}
                                            </span>

                                            <span className="text-xs font-mono text-slate-500">
                                                🗓️ {formatDate(a.startUtc)}
                                            </span>
                                        </div>

                                        <div className="text-xs text-slate-700">
                                            <span className="font-semibold text-slate-900">Patient:</span>{' '}
                                            {a.bookingSubjectType === 'SELF' ? (
                                                <span>{a.patientProfile.user.name}</span>
                                            ) : (
                                                <span>
                                                    {a.familyMember?.fullName}{' '}
                                                    <span className="text-slate-400">
                                                        (via {a.patientProfile.user.name})
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {a.rating && (
                                        <div className="shrink-0 rounded-2xl border border-amber-200/60 bg-amber-50/40 p-3 text-xs text-slate-800 sm:text-right">
                                            <div className="font-bold text-amber-700">
                                                ★ {a.rating.score}/5
                                            </div>
                                            {a.rating.comment && (
                                                <p className="mt-1 text-[11px] italic text-slate-600 max-w-xs truncate">
                                                    &ldquo;{a.rating.comment}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}