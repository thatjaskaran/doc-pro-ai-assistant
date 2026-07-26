import { notFound, redirect } from 'next/navigation';
import { getDoctorById } from '@/lib/doctors/repository';
import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { BookingForm } from './booking-form';
import { HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';
interface BookingPageProps {
    params: Promise<{ doctorId: string }>;
    searchParams: Promise<{ slot?: string }>;
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
    const { doctorId } = await params;
    const { slot } = await searchParams;

    let session;
    try {
        session = await requireRole('PATIENT');
    } catch {
        const target = `/booking/${doctorId}${slot ? `?slot=${encodeURIComponent(slot)}` : ''}`;
        redirect(`/sign-in?redirectTo=${encodeURIComponent(target)}`);
    }

    if (!slot) notFound(); // reaching this page without a chosen slot means the flow was skipped, not a valid state

    const doctor = await getDoctorById(doctorId);
    if (!doctor) notFound();

    const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: session.user.id } });
    if (!patientProfile) notFound(); // should be unreachable after the sign-up hook fix; fail safely if it somehow is

    const familyMembers = await prisma.familyMember.findMany({
        where: { patientProfileId: patientProfile.id },
        orderBy: { fullName: 'asc' },
    });

    const slotLabel = new Intl.DateTimeFormat('en-IN', {
        timeZone: HOSPITAL_TIMEZONE, dateStyle: 'full', timeStyle: 'short',
    }).format(new Date(slot));

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white px-4 py-10 text-slate-900 selection:bg-teal-600 selection:text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                
                {/* Header Section */}
                <div className="border-b border-slate-200/80 pb-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 mb-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                        Patient Checkout
                    </div>
                    <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Confirm Your Appointment
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Review your consultation details and select patient information before finalizing.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
                    
                    {/* Primary Booking Form Container */}
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <div className="border-b border-slate-200/60 pb-5 mb-6">
                            <h2 className="text-xl font-serif font-bold text-slate-900">
                                Patient Selection
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Specify who will be attending this appointment.
                            </p>
                        </div>

                        <BookingForm
                            doctorId={doctor.id}
                            slotStartUtc={slot}
                            familyMembers={familyMembers}
                        />
                    </div>

                    {/* Sidebar Summary Card */}
                    <aside className="sticky top-24 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
                        <div className="border-b border-slate-200/60 pb-4">
                            <h2 className="text-base font-serif font-bold text-slate-900">
                                Booking Summary
                            </h2>
                        </div>

                        <div className="space-y-5 text-xs sm:text-sm">
                            {/* Doctor Details */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                    Assigned Practitioner
                                </p>
                                <p className="text-base font-serif font-bold text-slate-900">
                                    {doctor.user.name}
                                </p>
                                <p className="font-mono text-xs text-teal-800">
                                    {doctor.specialties.map((s) => s.name).join(", ") || "General Practice"}
                                </p>
                            </div>

                            {/* Time Slot */}
                            <div className="border-t border-slate-200/60 pt-4 space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                    Scheduled Time
                                </p>
                                <p className="font-semibold text-slate-900">
                                    {slotLabel}
                                </p>
                            </div>

                            {/* Fee */}
                            <div className="border-t border-slate-200/60 pt-4 space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                    Consultation Fee
                                </p>
                                <p className="text-2xl font-serif font-bold text-slate-900">
                                    {(doctor.feeCents / 100).toLocaleString("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                        maximumFractionDigits: 0,
                                    })}
                                </p>
                            </div>

                            {/* Preparation Note Box */}
                            <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4 space-y-1.5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-teal-900 font-mono">
                                    Before Your Visit
                                </p>
                                <p className="text-xs text-slate-700 leading-relaxed">
                                    Please arrive 10–15 minutes early with any previous prescriptions or relevant medical records.
                                </p>
                            </div>
                        </div>
                    </aside>

                </div>

            </div>
        </main>
    );
}