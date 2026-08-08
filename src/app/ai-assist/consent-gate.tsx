'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { grantAiConsent } from './actions';

export function ConsentGate() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const consentItems: readonly string[] = [
        'Your description will be sent to an AI service to generate general guidance.',
        'This assistant does not diagnose conditions or recommend medications.',
        "If you show signs of a medical emergency, you'll be directed to seek emergency care instead.",
        'You choose whether to attach any generated summary to an appointment — nothing is saved unless you do.',
    ];

    function handleConsent(): void {
        setError(null);

        startTransition(async () => {
            try {
                await grantAiConsent();
                router.refresh();
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            }
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900">
                    Before you continue
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                    Please review the terms of use for our AI health assistant before proceeding.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
                    {error}
                </div>
            )}

            <ul className="space-y-3.5">
                {consentItems.map((item: string, idx: number) => (
                    <li
                        key={`consent-item-${idx}`}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs font-medium leading-relaxed text-slate-700 shadow-sm"
                    >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5"
                                />
                            </svg>
                        </div>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                onClick={handleConsent}
                disabled={isPending}
                className="w-full rounded-2xl bg-teal-800 py-3.5 font-mono text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="h-4 w-4 animate-spin text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Please wait…
                    </span>
                ) : (
                    'I understand, continue'
                )}
            </button>
        </div>
    );
}