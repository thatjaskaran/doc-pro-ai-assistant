'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SpecialtyFilterProps {
    specialties: { id: string; name: string }[];
}

export function SpecialtyFilter({ specialties }: SpecialtyFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => setHydrated(true), []);

    function handleChange(specialtyId: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (specialtyId) params.set('specialty', specialtyId);
        else params.delete('specialty');
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="w-full sm:w-64">
            <label
                htmlFor="specialty-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
            >
                Specialty
            </label>

            <div className="relative">
                <select
                    id="specialty-filter"
                    data-hydrated={hydrated}
                    value={searchParams.get('specialty') ?? ''}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200/80 bg-white py-3.5 pl-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-50 cursor-pointer"
                >
                    <option value="">All Specialties</option>

                    {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <svg
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </div>
    );
}