'use client';

import { useState } from 'react';
import { cancelAppointment } from './actions';

export function CancelButton({ appointmentId }: { appointmentId: string }) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleCancel() {
        setSubmitting(true);
        setError(null);
        const formData = new FormData();
        formData.set('appointmentId', appointmentId);
        const result = await cancelAppointment(formData);
        setSubmitting(false);
        if (result?.error) setError(result.error);
    }

    if (!confirming) {
        return (
            <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded-2xl border border-rose-200/80 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold font-mono text-rose-700 transition-all hover:bg-rose-100/80 hover:border-rose-300 active:scale-95"
            >
                Cancel Appointment
            </button>
        );
    }

    return (
        <div className="w-full max-w-sm rounded-3xl border border-rose-200/80 bg-rose-50/40 p-5 backdrop-blur-sm">
            <h4 className="text-sm font-serif font-bold text-rose-900">
                Cancel Appointment?
            </h4>

            <p className="mt-1.5 text-xs leading-relaxed text-rose-700/90">
                This action cannot be undone. Your appointment slot will be released and
                you'll need to book again if you change your mind.
            </p>

            {error && (
                <div
                    role="alert"
                    className="mt-3 rounded-2xl border border-rose-300/80 bg-white p-3 text-xs font-mono text-rose-800 shadow-sm"
                >
                    {error}
                </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                >
                    {submitting ? "Cancelling..." : "Yes, Cancel"}
                </button>

                <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                >
                    Keep Appointment
                </button>
            </div>
        </div>
    );
}