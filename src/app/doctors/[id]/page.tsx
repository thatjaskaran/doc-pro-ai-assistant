import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getDoctorById, getSlotsForDoctorOnDate } from '@/lib/doctors/repository';
import { HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';

interface DoctorDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ date?: string }>;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTemplateTime(date: Date) {
    return new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC',
    }).format(date);
}

function formatSlotTime(date: Date) {
    return new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: HOSPITAL_TIMEZONE,
    }).format(date);
}

function todayInHospitalTz(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: HOSPITAL_TIMEZONE }).format(new Date());
}

function nextSevenDateStrings(): string[] {
    const [y, m, d] = todayInHospitalTz().split('-').map(Number);
    const base = new Date(Date.UTC(y, m - 1, d));
    return Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(base.getTime() + i * 24 * 60 * 60_000);
        return dt.toISOString().slice(0, 10);
    });
}

export default async function DoctorDetailPage({ params, searchParams }: DoctorDetailPageProps) {
    const { id } = await params;
    const { date } = await searchParams;

    const doctor = await getDoctorById(id);
    if (!doctor) notFound();

    const availableDates = nextSevenDateStrings();
    const selectedDateKey = date && availableDates.includes(date) ? date : availableDates[0];
    const slots = await getSlotsForDoctorOnDate(doctor.id, selectedDateKey);

    const initials = doctor.user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/30 via-stone-50/40 to-white text-slate-900">
            {/* Header Section */}
            <section className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/doctors"
                        className="mb-6 inline-flex items-center text-xs font-semibold text-slate-500 hover:text-teal-700 font-mono transition"
                    >
                        ← Back to Doctors
                    </Link>

                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        {/* Profile Image / Initials */}
                        {doctor.user.image ? (
                            <Image
                                src={doctor.user.image}
                                alt={doctor.user.name}
                                width={96}
                                height={96}
                                className="h-24 w-24 shrink-0 rounded-3xl object-cover ring-2 ring-teal-100/80 shadow-sm"
                            />
                        ) : (
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-teal-50 font-serif text-3xl font-bold text-teal-800 ring-2 ring-teal-100/80 shadow-sm">
                                {initials}
                            </div>
                        )}

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                {doctor.specialties.map((s) => (
                                    <span
                                        key={s.id}
                                        className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 font-mono ring-1 ring-inset ring-teal-600/20"
                                    >
                                        {s.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="mt-2 text-3xl font-serif font-bold tracking-tight text-slate-900 sm:text-4xl">
                                {doctor.user.name}
                            </h1>

                            {doctor.bio && (
                                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
                                    {doctor.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 sm:px-6 lg:px-8">
                {/* Left Column - Weekly Hours */}
                <div className="space-y-8">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                            Weekly Operating Hours
                        </h2>

                        <div className="space-y-3">
                            {doctor.availability.map((slot) => (
                                <div
                                    key={slot.dayOfWeek}
                                    className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                                >
                                    <span className="text-sm font-semibold text-slate-800 font-mono">
                                        {DAY_NAMES[slot.dayOfWeek]}
                                    </span>

                                    <div className="text-right text-xs text-slate-600 space-y-0.5">
                                        <p className="font-mono">
                                            {formatTemplateTime(slot.workStart)} – {formatTemplateTime(slot.workEnd)}
                                        </p>

                                        {slot.breakStart && slot.breakEnd && (
                                            <p className="text-[11px] font-mono text-amber-700/80">
                                                Break: {formatTemplateTime(slot.breakStart)} – {formatTemplateTime(slot.breakEnd)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Booking System */}
                <div className="lg:col-span-2">
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="mb-6 text-2xl font-serif font-bold text-slate-900">
                            Book an Appointment
                        </h2>

                        {/* Date Selector */}
                        <div className="mb-8">
                            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                                1. Select Date
                            </h3>

                            <nav
                                aria-label="Select date"
                                className="flex flex-wrap gap-2.5"
                            >
                                {availableDates.map((key) => {
                                    const isSelected = key === selectedDateKey;

                                    const label = new Intl.DateTimeFormat("en-IN", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        timeZone: HOSPITAL_TIMEZONE,
                                    }).format(new Date(`${key}T12:00:00Z`));

                                    return (
                                        <Link
                                            key={key}
                                            href={`/doctors/${doctor.id}?date=${key}`}
                                            aria-current={isSelected ? "date" : undefined}
                                            className={`rounded-2xl px-4 py-2.5 text-xs font-semibold font-mono transition-all duration-200 ${
                                                isSelected
                                                    ? "bg-teal-800 text-white shadow-sm ring-2 ring-teal-800"
                                                    : "border border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/50"
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Time Slots */}
                        <div>
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                                2. Available Time Slots
                            </h3>

                            {slots.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/50 py-10 text-center">
                                    <p className="text-xs font-mono text-slate-500">
                                        No consultation slots available for this date.
                                    </p>
                                </div>
                            ) : (
                                <div
                                    role="list"
                                    aria-label="Available time slots"
                                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                                >
                                    {slots.map((slot) => (
                                        <Link
                                            key={slot.startUtc.toISOString()}
                                            href={
                                                slot.available
                                                    ? `/booking/${doctor.id}?slot=${slot.startUtc.toISOString()}`
                                                    : "#"
                                            }
                                            aria-disabled={!slot.available}
                                            className={`rounded-2xl border px-3.5 py-3 text-center text-xs font-mono font-semibold transition-all duration-150 ${
                                                slot.available
                                                    ? "border-teal-200/80 bg-teal-50/40 text-teal-900 hover:border-teal-600 hover:bg-teal-700 hover:text-white hover:shadow-sm"
                                                    : "cursor-not-allowed border-slate-200/60 bg-slate-100/60 text-slate-400 opacity-60"
                                            }`}
                                            style={{
                                                pointerEvents: slot.available ? "auto" : "none",
                                            }}
                                        >
                                            {formatSlotTime(slot.startUtc)}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}