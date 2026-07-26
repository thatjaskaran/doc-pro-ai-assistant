import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { getAnalyticsSummary } from '@/lib/admin/repository';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/sign-in?redirectTo=/admin/dashboard');
  }

  const stats = await getAnalyticsSummary();
  const revenueDisplay = (stats.estimatedRevenueCents / 100).toLocaleString('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white px-4 py-10 text-slate-900 selection:bg-teal-600 selection:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">

        {/* Header & Quick Nav */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Administrative Portal
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
              Admin Overview
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Platform analytics, doctor approvals, and operational insights.
            </p>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/admin/doctors"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              Doctor Applications
            </Link>
            <Link
              href="/admin/specialties"
              className="rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-95"
            >
              Manage Specialties
            </Link>
          </nav>
        </div>

        {/* Analytics Key Metrics Grid */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">
              Registered Patients
            </p>
            <p className="mt-3 text-3xl font-serif font-bold text-slate-900">
              {stats.totalPatients.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">
              Approved Doctors
            </p>
            <p className="mt-3 text-3xl font-serif font-bold text-teal-800">
              {stats.totalApprovedDoctors.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 font-mono">
              Pending Applications
            </p>
            <p className="mt-3 text-3xl font-serif font-bold text-amber-700">
              {stats.totalPendingDoctors.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl border border-teal-200 bg-teal-50/50 p-6 shadow-sm transition hover:shadow-md">
            <p className="text-xs font-medium uppercase tracking-wider text-teal-800 font-mono">
              Estimated Revenue
            </p>
            <p className="mt-3 text-3xl font-serif font-bold text-slate-900">
              {revenueDisplay}
            </p>
            <span className="mt-1 block text-[10px] text-slate-500">
              Completed Appointments
            </span>
          </div>

        </section>

        {/* Appointments Status Breakdowns */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">
            Appointments by Status
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const).map((s) => {
              const count = stats.statusCounts[s] ?? 0;
              return (
                <div
                  key={s}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 hover:bg-white"
                >
                  <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider text-slate-700 border border-slate-200">
                    {s}
                  </span>
                  <p className="mt-3 text-2xl font-serif font-bold text-slate-900">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}