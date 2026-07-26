import Link from 'next/link';
import { getOptionalSession } from '@/lib/auth/session';

const DASHBOARD_BY_ROLE: Record<string, { href: string; label: string }> = {
    PATIENT: { href: '/patient/dashboard', label: 'My Appointments' },
    DOCTOR: { href: '/doctor/dashboard', label: 'Doctor Dashboard' },
    ADMIN: { href: '/admin/dashboard', label: 'Admin Overview' },
};

export default async function HomePage() {
    const session = await getOptionalSession();
    const dashboardLink = session ? DASHBOARD_BY_ROLE[session.user.role] : null;

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/40 via-stone-50/50 to-white text-slate-900 selection:bg-teal-600 selection:text-white">
            {/* Hero Section */}
            <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8 lg:pt-20 lg:pb-28">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Hero Content */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/80 px-3.5 py-1 text-xs font-semibold text-teal-800 font-mono shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                            </span>
                            Doc Pro Care Network
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl font-serif leading-[1.12]">
                            Healthcare Made <br />
                            <span className="italic font-normal text-teal-800">Thoughtfully Simple.</span>
                        </h1>

                        <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
                            Connect with verified specialists, get instant AI-powered health guidance, and reserve real-time appointments tailored to your family&apos;s needs.
                        </p>

                        {/* Primary CTAs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            <Link
                                href="/doctors"
                                className="inline-flex items-center justify-center rounded-2xl bg-teal-800 px-7 py-3.5 text-xs font-semibold font-mono text-white shadow-sm transition hover:bg-teal-900 active:scale-[0.98]"
                            >
                                Find a Doctor →
                            </Link>

                            <Link
                                href="/ai-assist"
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-300/80 bg-white px-7 py-3.5 text-xs font-semibold font-mono text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]"
                            >
                                AI Symptom Triage
                            </Link>

                            {dashboardLink && (
                                <Link
                                    href={dashboardLink.href}
                                    className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 px-5 py-3.5 text-xs font-semibold font-mono text-teal-900 shadow-sm transition hover:bg-teal-100/70 active:scale-[0.98]"
                                >
                                    {dashboardLink.label}
                                </Link>
                            )}
                        </div>

                        {/* Key Metrics / Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/60">
                            <div>
                                <p className="font-serif text-xl sm:text-2xl font-bold text-slate-900">100%</p>
                                <p className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Verified Doctors</p>
                            </div>
                            <div>
                                <p className="font-serif text-xl sm:text-2xl font-bold text-slate-900">24/7</p>
                                <p className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Smart Triage</p>
                            </div>
                            <div>
                                <p className="font-serif text-xl sm:text-2xl font-bold text-slate-900">Instant</p>
                                <p className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Slot Booking</p>
                            </div>
                        </div>

                        <p className="text-[11px] font-mono text-slate-400">
                            Demo project with fictional seeded data — not a real medical service.
                        </p>
                    </div>

                    {/* Right Hero Visual Card: AI Interactive Preview */}
                    <div className="lg:col-span-5">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-50/50 rounded-full blur-2xl -z-0" />

                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 relative z-10">
                                <div>
                                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-800">
                                        Smart Matcher
                                    </span>
                                    <h3 className="font-serif text-lg font-bold text-slate-900">AI Health Guidance</h3>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                                    Live
                                </span>
                            </div>

                            {/* Mock Interactive Chat Preview */}
                            <div className="space-y-3 font-sans text-xs sm:text-sm relative z-10">
                                <div className="rounded-2xl bg-slate-100/80 p-4 text-slate-700 max-w-[88%] shadow-sm">
                                    &ldquo;I&apos;ve had a persistent pounding headache and eye sensitivity for three days.&rdquo;
                                </div>
                                <div className="rounded-2xl bg-teal-800 p-4 text-white max-w-[88%] ml-auto shadow-sm space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-teal-200">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        AI Guidance Generated
                                    </div>
                                    <p className="leading-relaxed">
                                        Based on your symptoms, we suggest consulting a <strong className="underline underline-offset-2 font-semibold">Neurologist</strong>. Here are top-rated specialists available today.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/ai-assist"
                                className="group rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 flex items-center justify-between text-xs text-teal-900 font-medium transition hover:bg-teal-100/70 relative z-10"
                            >
                                <span className="font-medium">Try our conversational AI assistant now</span>
                                <span className="font-mono font-semibold text-teal-800 group-hover:translate-x-0.5 transition-transform">
                                    Launch &rarr;
                                </span>
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            {/* Step Process Section */}
            <section className="border-t border-slate-200/80 bg-white py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="max-w-2xl mb-14 space-y-2">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-800">
                            Simplified Triage
                        </span>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 sm:text-4xl">
                            How Doc Pro Streamlines Care
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                            Designed to reduce wait times and remove friction from medical appointments.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="rounded-3xl border border-slate-200/80 bg-stone-50/40 p-8 space-y-4 shadow-sm transition hover:border-teal-200 hover:bg-white">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                                01
                            </span>
                            <h3 className="font-serif text-xl font-bold text-slate-900">Describe & Assist</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Filter by specialty, fee, or rating — or use our confidential AI assistant to identify the appropriate clinical specialty.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200/80 bg-stone-50/40 p-8 space-y-4 shadow-sm transition hover:border-teal-200 hover:bg-white">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                                02
                            </span>
                            <h3 className="font-serif text-xl font-bold text-slate-900">Select Slot</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                View real-time availability calendars for verified doctors and select an open consultation slot that fits your schedule.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200/80 bg-stone-50/40 p-8 space-y-4 shadow-sm transition hover:border-teal-200 hover:bg-white">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                                03
                            </span>
                            <h3 className="font-serif text-xl font-bold text-slate-900">Instant Booking</h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Secure appointments for yourself or family members, optionally attaching your AI summary for the doctor to review beforehand.
                            </p>
                        </div>

                    </div>

                </div>
            </section>
        </main>
    );
}