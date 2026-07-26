import { getSpecialtiesWithDoctorCount } from '@/lib/admin/repository';
import { ApplyDoctorForm } from './apply-doctor-form';

export default async function ApplyDoctorPage() {
    const specialties = await getSpecialtiesWithDoctorCount();

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
            {/* Header Section */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20">
                        Join Our Network
                    </span>

                    <h1 className="mt-3 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Apply as a Doctor
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                        Submit your details below. An administrator will review your application before you can accept
                        appointments — you can check your status any time from your dashboard after applying.
                    </p>
                </div>
            </section>

            {/* Form Container */}
            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
                    <ApplyDoctorForm specialties={specialties.map((s) => ({ id: s.id, name: s.name }))} />
                </div>
            </section>
        </main>
    );
}