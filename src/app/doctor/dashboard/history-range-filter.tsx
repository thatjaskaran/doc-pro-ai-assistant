'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const OPTIONS = [
    { value: 'day', label: 'Last 24 hours' },
    { value: 'week', label: 'Last 7 days' },
    { value: 'month', label: 'Last 30 days' },
    { value: 'all', label: 'All time' },
];

export function HistoryRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function handleChange(range: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('range', range);
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
            <label
                htmlFor="history-range"
                className="pl-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
            >
                Timeframe
            </label>

            <div className="relative">
                <select
                    id="history-range"
                    value={searchParams.get('range') ?? 'week'}
                    onChange={(e) => handleChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200/80 bg-slate-50/60 py-1.5 pl-3 pr-8 text-xs font-medium text-slate-800 outline-none transition hover:bg-slate-100/70 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10 cursor-pointer"
                >
                    {OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom Dropdown Chevron Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                    <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}