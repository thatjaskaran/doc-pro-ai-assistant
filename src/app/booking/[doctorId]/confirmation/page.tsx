import { notFound, redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';

interface ConfirmationPageProps {
    searchParams: Promise<{ appointmentId?: string }>;
}

export default async function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
    let session;
    try {
        session = await requireRole('PATIENT');
    } catch {
        redirect('/sign-in');
    }

    const { appointmentId } = await searchParams;
    if (!appointmentId) notFound();

    const patientProfile = await prisma.patientProfile.findUniqueOrThrow({ where: { userId: session.user.id } });

    const appointment = await prisma.appointment.findFirst({
        // Scoped to the caller's own profile -- prevents viewing someone else's
        // confirmation by guessing/enumerating an appointment ID in the URL.
        where: { id: appointmentId, patientProfileId: patientProfile.id },
        include: {
            doctorProfile: { include: { user: { select: { name: true } } } },
            familyMember: true,
            reason: true,
        },
    });
    if (!appointment) notFound();

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white px-4 py-12 selection:bg-teal-600 selection:text-white sm:px-6 lg:px-8">
            <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center justify-center">
                <div className="w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition sm:p-12">

                    {/* Success Header */}
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200/80 shadow-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-teal-800"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono">
                            Appointment {appointment.status}
                        </p>

                        <h1 className="mt-2 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Your booking is {appointment.status}!
                        </h1>

                        <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                            Your appointment has been successfully scheduled. You can manage and track its status anytime from your patient portal.
                        </p>
                    </div>

                    {/* Details Breakdown */}
                    <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8">
                        <h2 className="text-base font-serif font-bold text-slate-900">
                            Appointment Overview
                        </h2>

                        <dl className="mt-6 space-y-4 text-xs sm:text-sm">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                                <dt className="text-slate-500 font-medium">Status</dt>
                                <dd className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wider text-amber-800 uppercase">
                                    {appointment.status}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                                <dt className="text-slate-500 font-medium">Doctor</dt>
                                <dd className="font-serif font-bold text-slate-900">
                                    {appointment.doctorProfile.user.name}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3.5">
                                <dt className="text-slate-500 font-medium">Patient</dt>
                                <dd className="font-semibold text-slate-900">
                                    {appointment.bookingSubjectType === "SELF"
                                        ? "You"
                                        : appointment.familyMember?.fullName}
                                </dd>
                            </div>

                            <div className="flex items-start justify-between gap-6 border-b border-slate-200/60 pb-3.5">
                                <dt className="text-slate-500 font-medium">Scheduled Time</dt>
                                <dd className="text-right font-semibold text-slate-900">
                                    {new Intl.DateTimeFormat("en-IN", {
                                        timeZone: HOSPITAL_TIMEZONE,
                                        dateStyle: "full",
                                        timeStyle: "short",
                                    }).format(appointment.startUtc)}
                                </dd>
                            </div>

                            <div className="flex items-start justify-between gap-6 min-w-0">
                                <dt className="shrink-0 text-slate-500 font-medium">Reason for Visit</dt>
                                <dd className="max-w-xs text-right text-slate-700 leading-relaxed break-words min-w-0">
                                    {appointment.reason?.originalText || "Not specified"}
                                </dd>
                            </div>

                        </dl>
                    </div>

                    {/* Next Steps Banner */}
                    <div className="mt-6 rounded-2xl border border-teal-200/80 bg-teal-50/50 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-900 font-mono">
                            What's Next?
                        </p>

                        <ul className="mt-3 space-y-2 text-xs text-slate-700 leading-relaxed">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-700 shrink-0" />
                                Please arrive 10–15 minutes prior to your scheduled time slot.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-700 shrink-0" />
                                Bring along any relevant past prescriptions or medical reports.
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-700 shrink-0" />
                                Status notifications will be sent if adjustments occur.
                            </li>
                        </ul>
                    </div>

                    {/* Action Controls */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <a
                            href="/patient/dashboard"
                            className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-95"
                        >
                            View My Appointments
                        </a>

                        <a
                            href="/doctors"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
                        >
                            Find More Doctors
                        </a>
                    </div>

                </div>
            </section>
        </main>
    );
}