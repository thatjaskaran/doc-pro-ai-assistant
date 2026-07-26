'use client';

import { useState } from 'react';
import { updateAvailability } from './actions';

interface ExistingTemplate {
    workStart: string;
    workEnd: string;
    breakStart: string;
    breakEnd: string;
    sessionDurationMinutes: number;
}

export function AvailabilityForm({
    dayOfWeek,
    dayName,
    existing,
}: {
    dayOfWeek: number;
    dayName: string;
    existing: ExistingTemplate | null;
}) {
    const [closed, setClosed] = useState(!existing);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form inputs state to preserve changes when toggling "Closed"
    const [workStart, setWorkStart] = useState(existing?.workStart ?? '09:00');
    const [workEnd, setWorkEnd] = useState(existing?.workEnd ?? '17:00');
    const [breakStart, setBreakStart] = useState(existing?.breakStart ?? '');
    const [breakEnd, setBreakEnd] = useState(existing?.breakEnd ?? '');
    const [sessionDuration, setSessionDuration] = useState(
        existing?.sessionDurationMinutes ?? 30
    );

    async function handleSubmit(formData: FormData) {
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        formData.set('dayOfWeek', String(dayOfWeek));
        if (closed) formData.set('closed', 'on');

        const result = await updateAvailability(formData);
        setSubmitting(false);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Header & Closed Toggle */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div className="space-y-0.5">
                    <h2 className="text-lg font-serif font-bold text-slate-900">
                        {dayName}
                    </h2>
                    <p className="text-xs text-slate-500">
                        Set working hours and appointment slots
                    </p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 transition hover:bg-slate-100/80">
                    <input
                        type="checkbox"
                        checked={closed}
                        onChange={(e) => setClosed(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-600/20"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                        Closed Day
                    </span>
                </label>
            </div>

            {/* Schedule Inputs */}
            {!closed && (
                <div className="grid gap-5 md:grid-cols-2">
                    {/* Work Start */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`workStart-${dayOfWeek}`}
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
                        >
                            Work Start Time
                        </label>
                        <input
                            id={`workStart-${dayOfWeek}`}
                            type="time"
                            name="workStart"
                            value={workStart}
                            onChange={(e) => setWorkStart(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                        />
                    </div>

                    {/* Work End */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`workEnd-${dayOfWeek}`}
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
                        >
                            Work End Time
                        </label>
                        <input
                            id={`workEnd-${dayOfWeek}`}
                            type="time"
                            name="workEnd"
                            value={workEnd}
                            onChange={(e) => setWorkEnd(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                        />
                    </div>

                    {/* Break Start */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`breakStart-${dayOfWeek}`}
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
                        >
                            Break Start <span className="text-slate-400 font-sans">(Optional)</span>
                        </label>
                        <input
                            id={`breakStart-${dayOfWeek}`}
                            type="time"
                            name="breakStart"
                            value={breakStart}
                            onChange={(e) => setBreakStart(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                        />
                    </div>

                    {/* Break End */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`breakEnd-${dayOfWeek}`}
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
                        >
                            Break End <span className="text-slate-400 font-sans">(Optional)</span>
                        </label>
                        <input
                            id={`breakEnd-${dayOfWeek}`}
                            type="time"
                            name="breakEnd"
                            value={breakEnd}
                            onChange={(e) => setBreakEnd(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                        />
                    </div>

                    {/* Session Duration */}
                    <div className="space-y-1.5 md:col-span-2">
                        <label
                            htmlFor={`session-${dayOfWeek}`}
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
                        >
                            Session Duration (Minutes)
                        </label>
                        <input
                            id={`session-${dayOfWeek}`}
                            type="number"
                            name="sessionDurationMinutes"
                            min={10}
                            max={120}
                            value={sessionDuration}
                            onChange={(e) => setSessionDuration(Number(e.target.value))}
                            required
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div
                    role="alert"
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 p-4 text-xs font-medium text-red-700"
                >
                    <svg
                        className="h-4 w-4 shrink-0 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 p-4 text-xs font-medium text-teal-800"
                >
                    <svg
                        className="h-4 w-4 shrink-0 text-teal-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <span>Availability saved successfully.</span>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-teal-800 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? 'Saving...' : 'Save Availability'}
                </button>
            </div>
        </form>
    );
}