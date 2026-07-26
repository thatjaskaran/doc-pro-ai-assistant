import Link from 'next/link';
import { searchDoctors, listSpecialties } from '@/lib/doctors/repository';
import { DoctorCard } from './_components/doctor-card';
import { SpecialtyFilter } from './_components/specialty-filter';
import { SearchInput } from './_components/search-input';
import { SortSelect } from './_components/sort-select';

interface DoctorsPageProps {
    searchParams: Promise<{ specialty?: string; q?: string; sort?: string; page?: string }>;
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
    const params = await searchParams;
    const specialties = await listSpecialties();
    
    const currentPage = params.page ? Number(params.page) : 1;
    
    const { doctors, total, page, pageCount } = await searchDoctors({
        specialtyId: params.specialty,
        query: params.q,
        sort: params.sort as 'rating' | 'fee_asc' | 'fee_desc' | undefined,
        page: currentPage,
    });

    // Helper to generate updated URL search params for pagination links
    const createPageUrl = (pageNumber: number) => {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.set('q', params.q);
        if (params.specialty) queryParams.set('specialty', params.specialty);
        if (params.sort) queryParams.set('sort', params.sort);
        queryParams.set('page', pageNumber.toString());
        return `/doctors?${queryParams.toString()}`;
    };

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
            {/* Hero Section */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                        Healthcare Directory
                    </span>

                    <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Find a Doctor
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        Browse verified doctors, compare specialties, consultation fees,
                        ratings, and book appointments with confidence.
                    </p>

                    {/* Filter Bar Container */}
                    <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr] items-end">
                            <SearchInput />
                            <SpecialtyFilter specialties={specialties} />
                            <SortSelect />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {doctors.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/80 p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-serif text-teal-800 ring-2 ring-teal-100/60">
                            🩺
                        </div>

                        <h2 className="mt-5 text-xl font-serif font-bold text-slate-900">
                            No doctors found
                        </h2>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                            No doctors match your current filters.
                            <br />
                            Try searching with different keywords or selecting another specialty.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-semibold text-slate-900 font-mono">
                                {total} doctor{total === 1 ? '' : 's'} available
                            </p>

                            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold font-mono text-teal-800 ring-1 ring-inset ring-teal-200/60">
                                Page {page} of {pageCount}
                            </span>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {doctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor.id}
                                    doctor={doctor}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination Controls */}
                {pageCount > 1 && (
                    <nav
                        aria-label="Pagination"
                        className="mt-12 flex items-center justify-center gap-3"
                    >
                        {page > 1 ? (
                            <Link
                                href={createPageUrl(page - 1)}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                            >
                                ← Previous
                            </Link>
                        ) : (
                            <span className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-300 cursor-not-allowed">
                                ← Previous
                            </span>
                        )}

                        <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-2 text-xs font-bold text-slate-700 font-mono shadow-sm">
                            {page} / {pageCount}
                        </div>

                        {page < pageCount ? (
                            <Link
                                href={createPageUrl(page + 1)}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                            >
                                Next →
                            </Link>
                        ) : (
                            <span className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-300 cursor-not-allowed">
                                Next →
                            </span>
                        )}
                    </nav>
                )}
            </section>
        </main>
    );
}