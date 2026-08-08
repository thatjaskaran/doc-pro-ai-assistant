import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { requireRole } from '@/lib/auth/session';
import { searchDoctorsForAdmin, getSpecialtiesWithDoctorCount } from '@/lib/admin/repository';
import { PerformanceFilters } from './_components/performance-filters';

interface PageProps {
    searchParams: Promise<{ q?: string; specialty?: string }>;
}

type DoctorItem = Awaited<ReturnType<typeof searchDoctorsForAdmin>>[number];
type SpecialtyItem = Awaited<ReturnType<typeof getSpecialtiesWithDoctorCount>>[number];

export default async function DoctorPerformancePage({ searchParams }: PageProps) {
    try {
        await requireRole('ADMIN');
    } catch {
        redirect('/sign-in?redirectTo=/admin/doctors/performance');
    }

    const { q, specialty } = await searchParams;
    const [doctors, specialties] = await Promise.all([
        searchDoctorsForAdmin({ query: q, specialtyId: specialty }),
        getSpecialtiesWithDoctorCount(),
    ]);

    const getStatusBadgeStyle = (status: string) => {
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
            {/* Header Section */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                        Admin Portal
                    </span>

                    <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Doctor Performance
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        Monitor doctor activity, rating stats, application statuses, and appointment fulfillment metrics.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Filters Component */}
                <div className="mb-8">
                    <PerformanceFilters
                        specialties={specialties.map((s: SpecialtyItem) => ({
                            id: s.id,
                            name: `${s.name} (${s._count?.doctors ?? 0})`,
                        }))}
                    />
                </div>

                {/* Performance Cards List */}
                {doctors.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/80 p-10 text-center shadow-sm">
                        <div className="mx-auto relative flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-serif text-teal-800 ring-2 ring-teal-100/60">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="mt-4 text-lg font-serif font-bold text-slate-900">
                            No doctors match this search
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Try adjusting your search criteria or clear the filters.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {doctors.map((d: DoctorItem) => {
                            const counts = d.appointmentCounts as Record<string, number>;
                            const total = Object.values(counts ?? {}).reduce(
                                (sum: number, n: number) => sum + n,
                                0
                            );
                            const upcoming = (counts?.PENDING ?? 0) + (counts?.CONFIRMED ?? 0);

                            return (
                                <article
                                    key={d.id}
                                    className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            {/* Avatar */}
                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                                                {d.user?.image ? (
                                                    <Image
                                                        src={d.user.image}
                                                        alt={d.user.name ?? ''}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center font-bold font-serif text-teal-800 bg-teal-50">
                                                        {d.user?.name?.charAt(0) ?? 'D'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Doctor Bio Info */}
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-xl font-serif font-bold text-slate-900 leading-tight">
                                                        {d.user?.name}
                                                    </h2>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-mono ring-1 ring-inset ${getStatusBadgeStyle(
                                                            d.applicationStatus
                                                        )}`}
                                                    >
                                                        {d.applicationStatus}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-500">{d.user?.email}</p>

                                                {d.specialties && d.specialties.length > 0 && (
                                                    <p className="text-xs font-medium text-teal-800">
                                                        {d.specialties
                                                            .map((s: { name: string }) => s.name)
                                                            .join(', ')}
                                                    </p>
                                                )}

                                                <div className="pt-1 flex items-center gap-1.5 text-xs">
                                                    {d.ratingCount > 0 ? (
                                                        <>
                                                            <span className="font-bold text-amber-600">
                                                                ★ {Number(d.ratingAverage ?? 0).toFixed(1)}
                                                            </span>
                                                            <span className="text-slate-500 font-mono">
                                                                ({d.ratingCount} review
                                                                {d.ratingCount === 1 ? '' : 's'})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 italic">
                                                            No reviews yet
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Metrics Stats Grid */}
                                        <div className="flex flex-col gap-4 lg:items-end">
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center bg-slate-50/80 p-3 rounded-2xl border border-slate-100 font-mono text-xs">
                                                <div className="px-2 py-1">
                                                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">
                                                        Total
                                                    </span>
                                                    <span className="font-bold text-slate-800">
                                                        {total}
                                                    </span>
                                                </div>
                                                <div className="px-2 py-1">
                                                    <span className="block text-teal-600 text-[10px] uppercase font-semibold">
                                                        Done
                                                    </span>
                                                    <span className="font-bold text-teal-800">
                                                        {counts?.COMPLETED ?? 0}
                                                    </span>
                                                </div>
                                                <div className="px-2 py-1">
                                                    <span className="block text-amber-600 text-[10px] uppercase font-semibold">
                                                        Upcoming
                                                    </span>
                                                    <span className="font-bold text-amber-800">
                                                        {upcoming}
                                                    </span>
                                                </div>
                                                <div className="px-2 py-1">
                                                    <span className="block text-rose-600 text-[10px] uppercase font-semibold">
                                                        Cancelled
                                                    </span>
                                                    <span className="font-bold text-rose-800">
                                                        {counts?.CANCELLED ?? 0}
                                                    </span>
                                                </div>
                                                <div className="px-2 py-1 col-span-2 sm:col-span-1">
                                                    <span className="block text-slate-500 text-[10px] uppercase font-semibold">
                                                        No-Show
                                                    </span>
                                                    <span className="font-bold text-slate-700">
                                                        {counts?.NO_SHOW ?? 0}
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/admin/doctors/performance/${d.id}`}
                                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-teal-800 active:scale-95"
                                            >
                                                View Appointment History &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}