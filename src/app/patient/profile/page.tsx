import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
    let session;
    try {
        session = await requireRole('PATIENT');
    } catch {
        redirect('/sign-in?redirectTo=/patient/profile');
    }

    const [user, patientProfile] = await Promise.all([
        prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
        prisma.patientProfile.findUniqueOrThrow({ where: { userId: session.user.id } }),
    ]);

    const initials = user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
            {/* Header */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                        Patient Profile
                    </span>

                    <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                        My Profile
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        Keep your personal information up to date so doctors can contact you when needed.
                    </p>
                </div>
            </section>

            {/* Content Container */}
            <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                    {/* Profile Header Card */}
                    <div className="flex flex-col gap-6 border-b border-slate-100 bg-slate-50/50 p-6 sm:flex-row sm:items-center sm:p-8">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal-50 font-serif text-2xl font-bold text-teal-800 ring-2 ring-teal-100/80 shadow-sm">
                            {initials}
                        </div>

                        <div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900">
                                {user.name}
                            </h2>

                            <span className="mt-1 inline-flex items-center rounded-full bg-teal-50/80 px-2.5 py-0.5 text-xs font-semibold font-mono text-teal-800 ring-1 ring-inset ring-teal-600/20">
                                Patient Account
                            </span>
                        </div>
                    </div>

                    {/* Email Display (Read-Only) */}
                    <div className="border-b border-slate-100 p-6 sm:p-8">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 font-mono">
                            Email Address
                        </label>

                        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-mono font-medium text-slate-900">
                                {user.email}
                            </p>

                            <span className="inline-flex w-fit items-center rounded-full bg-slate-200/60 px-3 py-1 text-xs font-semibold font-mono text-slate-600">
                                Read Only
                            </span>
                        </div>

                        <p className="mt-2.5 text-xs text-slate-500">
                            Email cannot be changed directly from your profile settings. Contact support if you need to update it.
                        </p>
                    </div>

                    {/* Editable Form Section */}
                    <div className="p-6 sm:p-8">
                        <h3 className="mb-6 text-xl font-serif font-bold text-slate-900">
                            Personal Information
                        </h3>

                        <ProfileForm
                            initialName={user.name}
                            initialPhone={patientProfile.phone ?? ''}
                            initialImage={user.image}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}