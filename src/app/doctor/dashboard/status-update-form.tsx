'use client';

import { useState } from 'react';
import { updateAppointmentStatus } from './appointment-actions';

const NEXT_STATUS_OPTIONS: Record<
    string,
    { value: string; label: string; color: string }[]
> = {
    PENDING: [
        {
            value: 'CONFIRMED',
            label: 'Confirm',
            color: 'bg-teal-800 hover:bg-slate-900 text-white shadow-sm',
        },
        {
            value: 'CANCELLED',
            label: 'Decline',
            color: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
        },
    ],
    CONFIRMED: [
        {
            value: 'COMPLETED',
            label: 'Mark Completed',
            color: 'bg-teal-800 hover:bg-slate-900 text-white shadow-sm',
        },
        {
            value: 'NO_SHOW',
            label: 'No Show',
            color: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
        },
        {
            value: 'CANCELLED',
            label: 'Cancel',
            color: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
        },
    ],
};

interface Props {
    appointmentId: string;
    currentStatus: string;
}

export function StatusUpdateForm({
    appointmentId,
    currentStatus,
}: Props) {
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const options = NEXT_STATUS_OPTIONS[currentStatus] ?? [];

    async function handleClick(newStatus: string) {
        setSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.set('appointmentId', appointmentId);
        formData.set('newStatus', newStatus);

        const result = await updateAppointmentStatus(formData);

        setSubmitting(false);

        if (result?.error) {
            setError(result.error);
        }
    }

    if (options.length === 0) return null;

    return (
        <div className="space-y-3">
            {error && (
                <div
                    role="alert"
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs font-medium text-red-700"
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

            <div className="flex flex-wrap items-center gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleClick(option.value)}
                        disabled={submitting}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${option.color}`}
                    >
                        {submitting ? 'Updating...' : option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}