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
      
      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          
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
              Connect with verified specialists, streamline triage with clinical AI specialty matching, and book real-time appointments tailored to your family&apos;s healthcare journey.
            </p>

            {/* Primary Action Buttons */}
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
                AI Specialty Finder
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
                    Smart Triage
                  </span>
                  <h3 className="font-serif text-lg font-bold text-slate-900">Specialty Matching AI</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                  Live Preview
                </span>
              </div>

              {/* Chat Interface Mockup */}
              <div className="space-y-3 font-sans text-xs sm:text-sm relative z-10">
                <div className="rounded-2xl bg-slate-100/80 p-4 text-slate-700 max-w-[88%] shadow-sm">
                  &ldquo;I&apos;ve had a persistent pounding headache and eye sensitivity for three days.&rdquo;
                </div>
                <div className="rounded-2xl bg-teal-800 p-4 text-white max-w-[88%] ml-auto shadow-sm space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-teal-200">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Clinical Specialty Match
                  </div>
                  <p className="leading-relaxed">
                    Based on your described symptoms, consulting a <strong className="underline underline-offset-2 font-semibold">Neurologist</strong> is recommended.
                  </p>
                  <div className="pt-1 text-[11px] text-teal-100 border-t border-teal-700/60 font-mono">
                    ✓ Structured intake summary ready to attach to booking.
                  </div>
                </div>
              </div>

              <Link
                href="/ai-assist"
                className="group rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 flex items-center justify-between text-xs text-teal-900 font-medium transition hover:bg-teal-100/70 relative z-10"
              >
                <span className="font-medium">Launch AI Triage Assistant</span>
                <span className="font-mono font-semibold text-teal-800 group-hover:translate-x-0.5 transition-transform">
                  Start Chat &rarr;
                </span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS COUNT & METRICS SECTION */}
      <section className="border-y border-slate-200/80 bg-white/70 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-200/60">
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">100%</p>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-wider font-semibold">Verified Doctors</p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">&lt; 2 mins</p>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-wider font-semibold">Average Triage Time</p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">24 / 7</p>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-wider font-semibold">Real-Time Booking</p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">0%</p>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-wider font-semibold">Medical Over-Promising</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW THE AI ASSISTANT WORKS */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-800">
            Intelligent Navigation
          </span>
          <h2 className="text-3xl font-serif font-bold text-slate-900 sm:text-4xl">
            How Our AI Helps You Find the Right Care
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Navigating healthcare specialties can be confusing. Doc Pro&apos;s AI assistant acts as a smart administrative guide to direct you to the correct specialist without giving unsafe medical advice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: What AI Does */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 space-y-4 shadow-sm relative overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800 font-bold font-mono text-base border border-teal-200/60">
              01
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">Specialty Directing</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Describe how you are feeling in natural plain language. The AI evaluates your symptoms solely to match you with relevant medical departments (e.g., Cardiology, Dermatology, Orthopedics).
            </p>
          </div>

          {/* Card 2: Summary Generation */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 space-y-4 shadow-sm relative overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800 font-bold font-mono text-base border border-teal-200/60">
              02
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900">Intake Summary</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Once your chat session ends, click <strong className="text-slate-800 font-semibold">&ldquo;Get Guidance&rdquo;</strong> to generate a concise summary. You can directly attach this summary to your appointment reservation for your doctor to review.
            </p>
          </div>

          {/* Card 3: Strict Safety Boundaries */}
          <div className="rounded-3xl border border-amber-200/80 bg-amber-50/30 p-8 space-y-4 shadow-sm relative overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900 font-bold font-mono text-base border border-amber-300/60">
              03
            </div>
            <h3 className="font-serif text-xl font-bold text-amber-950">Safety Boundaries</h3>
            <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
              Our AI <strong className="underline decoration-amber-400">never diagnoses diseases</strong> and <strong className="underline decoration-amber-400">never prescribes medications</strong>. Clinical judgments remain 100% in the hands of human healthcare professionals.
            </p>
          </div>
        </div>
      </section>

      {/* 4. STEP-BY-STEP PROCESS SECTION */}
      <section className="border-t border-slate-200/80 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="max-w-2xl mb-14 space-y-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-800">
              Simplified Journey
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900 sm:text-4xl">
              How Doc Pro Streamlines Care
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Designed to reduce wait times and remove friction from medical appointment scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="rounded-3xl border border-slate-200/80 bg-stone-50/40 p-8 space-y-4 shadow-sm transition hover:border-teal-200 hover:bg-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                01
              </span>
              <h3 className="font-serif text-xl font-bold text-slate-900">Describe & Filter</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Filter by specialty, consultation fee, or rating — or use our confidential AI assistant to identify the appropriate clinical specialty for your needs.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-stone-50/40 p-8 space-y-4 shadow-sm transition hover:border-teal-200 hover:bg-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                02
              </span>
              <h3 className="font-serif text-xl font-bold text-slate-900">Select Slot</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                View real-time availability calendars for verified doctors and select an open consultation slot that aligns with your schedule.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-stone-50/40 p-8 space-y-4 shadow-sm transition hover:border-teal-200 hover:bg-white">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-mono text-xs font-bold">
                03
              </span>
              <h3 className="font-serif text-xl font-bold text-slate-900">Instant Booking</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Secure appointments for yourself or family members, optionally attaching your AI intake summary for doctor review prior to the appointment.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. PATIENT FEATURES & CAPABILITIES (PATIENT-FOCUSED) */}
      <section className="py-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-200/60">
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-800">
            Patient Experience
          </span>
          <h2 className="text-3xl font-serif font-bold text-slate-900 sm:text-4xl">
            Everything You Can Do on Doc Pro
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            We built Doc Pro with features designed to give you total control over your medical visits and health records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-sm transition hover:border-teal-200">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Smart Search</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter doctors by specialty, ratings, consultation fees, and available time slots.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-sm transition hover:border-teal-200">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Family Booking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Book consultations for yourself, your children, or elderly parents under one account.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-sm transition hover:border-teal-200">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Intake Summaries</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Attach pre-appointment symptom notes so your doctor can prepare ahead of time.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-3 shadow-sm transition hover:border-teal-200">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900">My Appointments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track upcoming visits, reschedule when needed, and view past medical history anytime.
            </p>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="bg-teal-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-serif font-bold sm:text-4xl">
            Ready to Explore Doc Pro?
          </h2>
          <p className="max-w-xl mx-auto text-teal-100 text-sm sm:text-base leading-relaxed">
            Find specialists near you, experiment with our AI triage assistant, or explore patient and doctor dashboard workflows.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
            <Link
              href="/doctors"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3.5 text-xs font-semibold font-mono text-teal-950 shadow-sm transition hover:bg-teal-50 active:scale-[0.98]"
            >
              Browse Doctor Directory
            </Link>
            <Link
              href="/ai-assist"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-teal-700 bg-teal-800 px-8 py-3.5 text-xs font-semibold font-mono text-white shadow-sm transition hover:bg-teal-750 active:scale-[0.98]"
            >
              Try AI Specialty Matcher
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}