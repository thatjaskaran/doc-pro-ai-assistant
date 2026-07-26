import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { getAiConsentStatus } from './actions';
import { ConsentGate } from './consent-gate';
import { IntakeForm } from './intake-form';

export default async function AiAssistPage() {
    try {
        await requireRole('PATIENT');
    } catch {
        redirect('/sign-in?redirectTo=/ai-assist');
    }

    const { hasConsented } = await getAiConsentStatus();

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
            {/* Header Section */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                        Smart Triage
                    </span>

                    <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                        AI Health Guidance
                    </h1>

                    {/* Disclaimer Box */}
                    <div className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs font-medium leading-relaxed text-amber-900 shadow-sm">
                        <div className="flex items-start gap-2.5">
                            <svg
                                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <span>
                                <strong className="font-semibold text-amber-950">
                                    This is not a diagnosis, prescription, or medical advice.
                                </strong>{' '}
                                It provides general educational information and can suggest which type of doctor to see. For anything urgent, contact emergency services directly.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Section */}
            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
                    {hasConsented ? <IntakeForm /> : <ConsentGate />}
                </div>
            </section>
        </main>
    );
}