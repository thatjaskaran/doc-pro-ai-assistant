'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function SortSelect() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(sort: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col">
            <label
                htmlFor="sort-select"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
            >
                Sort by
            </label>

            <div className="relative">
                <select
                    id="sort-select"
                    value={searchParams.get('sort') ?? 'rating'}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200/80 bg-white py-3.5 pl-4 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-50 cursor-pointer"
                >
                    <option value="rating">Highest rated</option>
                    <option value="fee_asc">Fee: Low to High</option>
                    <option value="fee_desc">Fee: High to Low</option>
                </select>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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