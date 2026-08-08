'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Specialty {
    id: string;
    name: string;
}

export function PerformanceFilters({ specialties }: { specialties: Specialty[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const urlQuery = searchParams.get('q') ?? '';
    const [query, setQuery] = useState(urlQuery);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstRender = useRef(true);

    // Keep internal input state in sync when URL changes externally (e.g. Back/Forward button)
    useEffect(() => {
        setQuery(urlQuery);
    }, [urlQuery]);

    // Handle debounced search input changes
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (query.trim()) {
                params.set('q', query.trim());
            } else {
                params.delete('q');
            }

            // Optional: Reset pagination if present in searchParams
            if (params.has('page')) params.set('page', '1');

            const queryString = params.toString();
            router.push(queryString ? `${pathname}?${queryString}` : pathname);
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, pathname, router, searchParams]);

    function handleSpecialtyChange(specialtyId: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (specialtyId) {
            params.set('specialty', specialtyId);
        } else {
            params.delete('specialty');
        }

        if (params.has('page')) params.set('page', '1');

        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }

    function handleClearSearch() {
        setQuery('');
    }

    return (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Search Input Field */}
                <div className="relative flex-1">
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

                    <input
                        type="text"
                        placeholder="Search doctor by name or email…"
                        aria-label="Search doctors"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Specialty Select Field */}
                <div className="w-full sm:w-72">
                    <select
                        aria-label="Filter by specialty"
                        value={searchParams.get('specialty') ?? ''}
                        onChange={(e) => handleSpecialtyChange(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                        <option value="">All specialties</option>
                        {specialties.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}