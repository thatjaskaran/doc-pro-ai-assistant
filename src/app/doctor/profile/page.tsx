import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { ProfileForm } from './profile-form';

export default async function DoctorProfilePage() {
  let session;
  try {
    session = await requireRole('DOCTOR');
  } catch {
    redirect('/sign-in?redirectTo=/doctor/profile');
  }

  const [user, doctorProfile, allSpecialties] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.doctorProfile.findUniqueOrThrow({
      where: { userId: session.user.id },
      include: { specialties: true },
    }),
    prisma.specialty.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-800 ring-emerald-600/20';
      case 'PENDING':
        return 'bg-amber-50 text-amber-800 ring-amber-600/20';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-800 ring-rose-600/20';
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
      {/* Header Section */}
      <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
            Doctor Portal
          </span>

          <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Manage your professional details, clinical specialties, profile photo, and consultation fees.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Account Info Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Account Details
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500">Email Address</span>
              <p className="text-sm font-semibold text-slate-900">{user.email}</p>
              <p className="text-[11px] text-slate-400 italic">Contact support to change email address.</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500">Application Status</span>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold font-mono ring-1 ring-inset ${getStatusBadgeStyle(
                    doctorProfile.applicationStatus
                  )}`}
                >
                  {doctorProfile.applicationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Form Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Edit Information
          </h2>

          <ProfileForm
            initialName={user.name}
            initialImage={user.image}
            initialBio={doctorProfile.bio ?? ''}
            initialFeeRupees={doctorProfile.feeCents / 100}
            allSpecialties={allSpecialties.map((s) => ({ id: s.id, name: s.name }))}
            selectedSpecialtyIds={doctorProfile.specialties.map((s) => s.id)}
          />
        </div>
      </section>
    </main>
  );
}