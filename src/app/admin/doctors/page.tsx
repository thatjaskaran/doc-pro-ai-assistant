import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { getAllDoctorsForReview } from '@/lib/admin/repository';
import { ReviewForm } from './review-form';

export default async function AdminDoctorsPage() {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/sign-in?redirectTo=/admin/doctors');
  }

  const doctors = await getAllDoctorsForReview();
  type DoctorReviewRow = Awaited<ReturnType<typeof getAllDoctorsForReview>>[number];

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white px-4 py-10 text-slate-900 selection:bg-teal-600 selection:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header Section */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            Verification Queue
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
            Doctor Applications
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review and approve medical professional credential submissions.
          </p>
        </div>

        {/* Applications List */}
        {doctors.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              No pending or registered doctor applications found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {doctors.map((d: DoctorReviewRow) => {
              const statusStyles = {
                APPROVED: 'bg-teal-50 text-teal-800 border-teal-200',
                REJECTED: 'bg-red-50 text-red-700 border-red-200',
                PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
              }[d.applicationStatus] ?? 'bg-slate-50 text-slate-700 border-slate-200';

              return (
                <article
                  key={d.id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                    {/* Doctor Info */}
                    <div className="space-y-3 lg:max-w-xl">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-serif font-bold text-slate-900">
                          {d.user.name}
                        </h2>
                        <span className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wider uppercase ${statusStyles}`}>
                          {d.applicationStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="font-medium text-slate-900">{d.user.email}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-teal-800">
                          {d.specialties.map((s) => s.name).join(', ') || 'No specialty assigned'}
                        </span>
                      </div>

                      {d.reviewNote && (
                        <div className="rounded-xl border border-slate-200/60 bg-stone-50/80 p-3 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800 font-mono uppercase tracking-wider text-[10px]">Last Note: </span>
                          {d.reviewNote}
                        </div>
                      )}
                    </div>

                    {/* Review Form Component */}
                    <div className="w-full lg:w-auto lg:min-w-[360px]">
                      <ReviewForm doctorProfileId={d.id} currentStatus={d.applicationStatus} />
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}