import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-slate-200/80 bg-stone-50/70 px-4 py-12 text-slate-600 selection:bg-teal-600 selection:text-white sm:px-6 lg:px-8">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-teal-600/20 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">

          {/* Left Brand & Disclaimer Section */}
          <div className="lg:col-span-7 space-y-3 text-center sm:text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-900 font-serif text-sm font-bold text-white shadow-sm ring-1 ring-teal-700/30">
                D+
              </div>
              <span className="text-2xl font-serif font-semibold tracking-tight text-slate-900">
                Doc Pro
              </span>
            </Link>

            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
              Doc Pro is a portfolio demo project using fictional seeded data. It is not a real medical service, does not provide medical advice, and should not be used to make healthcare decisions.
            </p>
          </div>

          {/* Right Navigation Links (Centered Container) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-center">
            <nav
              aria-label="Footer Navigation"
              className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-sm"
            >
              <Link
                href="/doctors"
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:text-teal-800 hover:bg-slate-50"
              >
                Find a Doctor
              </Link>
              <Link
                href="/ai-assist"
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:text-teal-800 hover:bg-slate-50"
              >
                AI Assistant
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="mt-8 border-t border-slate-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} Doc Pro. Built as a demonstration project.</p>
          <div className="flex items-center gap-2 text-teal-800 font-mono text-[11px] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
            AI Assistant Module is Live
          </div>
        </div>
      </div>
    </footer>
  );
}