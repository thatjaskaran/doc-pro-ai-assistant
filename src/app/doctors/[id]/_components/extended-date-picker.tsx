'use client';

import { useRouter } from 'next/navigation';
import { AUTO_CONFIRM_WINDOW_DAYS } from '@/lib/scheduling/policy';

interface ExtendedDatePickerProps {
  doctorId: string;
  minDate: string;
  maxDaysAhead?: number;
}

function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map((num: string) => Number(num));
  const y = parts[0] ?? new Date().getFullYear();
  const m = parts[1] ?? new Date().getMonth() + 1;
  const d = parts[2] ?? new Date().getDate();

  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function ExtendedDatePicker({
  doctorId,
  minDate,
  maxDaysAhead = 30,
}: ExtendedDatePickerProps) {
  const router = useRouter();

  // Strict 30-day (1 month) limit from minDate
  const daysAllowed = Math.min(maxDaysAhead, 30);
  const maxDate = addDays(minDate, daysAllowed);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      router.push(`/doctors/${doctorId}?date=${selectedDate}`);
    }
  };

  const handleOpenPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>): void => {
    try {
      e.currentTarget.showPicker();
    } catch {
      // Fallback for older browser engines
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all hover:border-slate-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-teal-500" />
            <label htmlFor="extended-date-picker" className="text-xs font-bold tracking-tight text-slate-800">
              Select Appointment Date
            </label>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-100">
              Max 1 Month
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Pick a date between <span className="font-semibold text-slate-700">{minDate}</span> and{' '}
            <span className="font-semibold text-slate-700">{maxDate}</span>.
          </p>
        </div>

        <div className="relative">
          <input
            id="extended-date-picker"
            type="date"
            min={minDate}
            max={maxDate}
            onChange={handleDateChange}
            onClick={handleOpenPicker}
            onFocus={handleOpenPicker}
            /* Prevent key typing so input acts purely as a picker button */
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.preventDefault()}
            className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-inner transition hover:bg-slate-100/80 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer select-none"
          />
        </div>
      </div>

      {/* Policy Note */}
      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-stone-50/70 p-3 text-[11px] leading-relaxed text-slate-600">
        <span className="text-base leading-none">💡</span>
        <div>
          <strong className="font-semibold text-slate-800">Booking policy:</strong> Appointments within the next{' '}
          <span className="font-mono font-bold text-teal-700">{AUTO_CONFIRM_WINDOW_DAYS} days</span> are confirmed instantly.
          Dates up to 30 days ahead will be submitted for doctor confirmation.
        </div>
      </div>
    </div>
  );
}