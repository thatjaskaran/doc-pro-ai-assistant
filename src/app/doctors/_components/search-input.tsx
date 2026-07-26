'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const paramValue = searchParams.get('q') ?? '';
  const [value, setValue] = useState(paramValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Sync internal state if URL search params change externally
  useEffect(() => {
    setValue(paramValue);
  }, [paramValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // no navigation on mount
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('q', value);
      else params.delete('q');
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className="w-full flex-1">
      <label
        htmlFor="doctor-search"
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
      >
        Search Doctors
      </label>

      <div className="relative">
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
          id="doctor-search"
          type="text"
          placeholder="Search by doctor's name or specialty..."
          aria-label="Search doctors"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-2xl border border-slate-200/80 bg-white py-3.5 pl-11 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}