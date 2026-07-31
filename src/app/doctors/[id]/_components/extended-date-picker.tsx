'use client';

import { useRouter } from 'next/navigation';
import { AUTO_CONFIRM_WINDOW_DAYS } from '@/lib/scheduling/policy';

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function ExtendedDatePicker({
  doctorId,
  minDate,
  maxDaysAhead,
}: {
  doctorId: string;
  minDate: string;
  maxDaysAhead: number;
}) {
  const router = useRouter();
  const maxDate = addDays(minDate, maxDaysAhead);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="extended-date-picker" className="text-xs font-semibold text-slate-800">
          Need a later date? <span className="text-slate-500 font-normal">Pick any day up to {maxDaysAhead} days ahead:</span>
        </label>
        
        <input
          id="extended-date-picker"
          type="date"
          min={minDate}
          max={maxDate}
          onChange={(e) => {
            if (e.target.value) {
              router.push(`/doctors/${doctorId}?date=${e.target.value}`);
            }
          }}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        💡 <strong className="font-semibold text-slate-700">Booking policy:</strong> Bookings within the next{' '}
        <span className="font-mono font-semibold text-teal-800">{AUTO_CONFIRM_WINDOW_DAYS} days</span> are confirmed instantly.
        Bookings further out are held as pending until the doctor confirms them.
      </p>
    </div>
  );
}