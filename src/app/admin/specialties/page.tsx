import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { getSpecialtiesWithDoctorCount } from '@/lib/admin/repository';
import { CreateSpecialtyForm, DeleteSpecialtyButton } from './specialty-form';

export default async function AdminSpecialtiesPage() {
  try {
    await requireRole('ADMIN');
  } catch {
    redirect('/sign-in?redirectTo=/admin/specialties');
  }

  const specialties = await getSpecialtiesWithDoctorCount();

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white px-4 py-10 text-slate-900 selection:bg-teal-600 selection:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            Clinical Taxonomy
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
            Medical Specialties
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage active medical categories and view specialist distribution.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Create Specialty Sidebar Form */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <CreateSpecialtyForm />
          </div>

          {/* Specialties List */}
          <div className="lg:col-span-8 space-y-4">
            {specialties.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  No specialties created yet. Use the form to add one.
                </p>
              </div>
            ) : (
              specialties.map((s) => (
                <article
                  key={s.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="space-y-1 sm:max-w-md">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-serif font-bold text-slate-900">
                        {s.name}
                      </h2>
                      <span className="inline-block rounded-md border border-teal-200/80 bg-teal-50 px-2 py-0.5 text-[10px] font-bold font-mono text-teal-800">
                        {s._count.doctors} doctor{s._count.doctors === 1 ? '' : 's'}
                      </span>
                    </div>

                    {s.description ? (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {s.description}
                      </p>
                    ) : (
                      <p className="text-xs italic text-slate-400">
                        No description provided.
                      </p>
                    )}
                  </div>

                  <div className="sm:shrink-0">
                    <DeleteSpecialtyButton specialtyId={s.id} />
                  </div>
                </article>
              ))
            )}
          </div>

        </div>

      </div>
    </main>
  );
}