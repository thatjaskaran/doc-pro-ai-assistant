'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HOSPITAL_TIMEZONE } from '@/lib/scheduling/slots';
import { RatingForm } from './rating-form';

export interface HistoryAppointment {
    id: string;
    startUtc: string | Date;
    status: string;
    bookingSubjectType: string;
    doctorProfileId: string;
    doctorProfile: {
        feeCents: number;
        user: { name: string | null; image: string | null };
        specialties: { name: string }[];
    };
    familyMember: { fullName: string } | null;
    reason: { originalText: string; aiSummaryJson: unknown } | null;
    rating: { score: number; comment: string | null } | null;
}

function formatDate(d: string | Date) {
    if (!d) return '';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';

    return new Intl.DateTimeFormat('en-IN', {
        timeZone: HOSPITAL_TIMEZONE,
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(dateObj);
}

function formatCurrency(amountCents: number) {
    return (amountCents / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    });
}

function getStatusBadgeStyle(status: string) {
    switch (status) {
        case 'CONFIRMED':
            return 'bg-emerald-50 text-emerald-800 ring-emerald-600/20';
        case 'PENDING':
            return 'bg-amber-50 text-amber-800 ring-amber-600/20';
        case 'COMPLETED':
            return 'bg-teal-50 text-teal-800 ring-teal-600/20';
        case 'CANCELLED':
            return 'bg-rose-50 text-rose-800 ring-rose-600/20';
        default:
            return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
}

export function HistoryList({ history }: { history: HistoryAppointment[] }) {
    const [query, setQuery] = useState('');

    const filtered = history.filter((a) => {
        const doctorName = a.doctorProfile?.user?.name ?? '';
        const specialties = a.doctorProfile?.specialties?.map((s) => s.name).join(' ') ?? '';
        const haystack = `${doctorName} ${specialties}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
    });

    return (
        <div className="space-y-6">
            {/* Filter Search Input */}
            <div className="relative">
                <input
                    type="search"
                    placeholder="Filter by doctor or specialty…"
                    aria-label="Filter appointments"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3.5 text-sm text-slate-800 shadow-sm backdrop-blur-sm transition focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 placeholder:text-slate-400"
                />
            </div>

            {/* Empty State */}
            {filtered.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center text-xs font-mono text-slate-500 shadow-sm">
                    {history.length === 0
                        ? 'No past appointments found.'
                        : `No past appointments match "${query}".`}
                </div>
            ) : (
                /* Appointment Cards */
                <div className="space-y-4">
                    {filtered.map((a) => (
                        <article
                            key={a.id}
                            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-4 flex-1">
                                    {/* Status Badge & Subject */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono ring-1 ring-inset ${getStatusBadgeStyle(
                                                a.status
                                            )}`}
                                        >
                                            {a.status}
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-semibold font-mono text-slate-600">
                                            For: {a.bookingSubjectType === 'SELF' ? 'You' : a.familyMember?.fullName}
                                        </span>
                                    </div>

                                    {/* Doctor Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                                            {a.doctorProfile?.user?.image ? (
                                                <Image
                                                    src={a.doctorProfile.user.image}
                                                    alt={a.doctorProfile.user.name ?? 'Doctor'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center font-bold font-serif text-teal-800 bg-teal-50">
                                                    {a.doctorProfile?.user?.name?.charAt(0) ?? 'D'}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-serif font-bold text-slate-900 leading-tight">
                                                {a.doctorProfile?.user?.name}
                                            </h3>
                                            {a.doctorProfile?.specialties && a.doctorProfile.specialties.length > 0 && (
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    {a.doctorProfile.specialties.map((s) => s.name).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Appointment Details */}
                                    <div className="space-y-1 text-xs">
                                        <p className="font-mono text-slate-600" suppressHydrationWarning>
                                            🗓️ {formatDate(a.startUtc)}
                                        </p>
                                        <p className="font-semibold text-slate-700">
                                            Fee: {formatCurrency(a.doctorProfile?.feeCents ?? 0)}
                                        </p>
                                    </div>

                                    {/* Reason */}
                                    {a.reason?.originalText && (
                                        <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                            <span className="font-semibold text-slate-700">Reason:</span>{' '}
                                            {a.reason.originalText}
                                        </p>
                                    )}

                                    {/* AI Summary */}
                                    {a.reason?.aiSummaryJson != null && (
                                        <details className="mt-3 rounded-2xl border border-teal-200/80 bg-teal-50/40 p-3 text-xs text-slate-700">
                                            <summary className="cursor-pointer font-semibold text-teal-800 select-none hover:underline">
                                                📋 AI-generated summary you attached
                                            </summary>
                                            <div className="mt-2.5 space-y-1.5 border-t border-teal-100 pt-2.5">
                                                <p>
                                                    <strong>Suggested specialty:</strong>{' '}
                                                    {(a.reason.aiSummaryJson as any).suggestedSpecialty}
                                                </p>
                                                <p className="leading-relaxed">
                                                    {(a.reason.aiSummaryJson as any).patientEducationSummary}
                                                </p>
                                                {(a.reason.aiSummaryJson as any).urgencyNote && (
                                                    <p className="text-[11px] text-amber-800 font-medium italic">
                                                        {(a.reason.aiSummaryJson as any).urgencyNote}
                                                    </p>
                                                )}
                                            </div>
                                        </details>
                                    )}

                                    {/* Rating Block */}
                                    {a.status === 'COMPLETED' && (
                                        <div className="mt-4 pt-3 border-t border-slate-100">
                                            {a.rating ? (
                                                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-3.5 text-xs text-slate-800">
                                                    <div className="flex items-center gap-1.5 font-semibold text-amber-700">
                                                        <span>{'★'.repeat(a.rating.score)}</span>
                                                        <span className="font-mono text-slate-600">
                                                            ({a.rating.score}/5)
                                                        </span>
                                                    </div>
                                                    {a.rating.comment && (
                                                        <p className="mt-1.5 italic text-slate-600 leading-relaxed">
                                                            &ldquo;{a.rating.comment}&rdquo;
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    <RatingForm appointmentId={a.id} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Re-book Button */}
                                <div className="flex flex-col items-start lg:items-end">
                                    <Link
                                        href={`/doctors/${a.doctorProfileId}`}
                                        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 active:scale-95"
                                    >
                                        Book again with {a.doctorProfile?.user?.name ?? 'Doctor'}
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}