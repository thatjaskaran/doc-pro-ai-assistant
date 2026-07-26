'use client';

import { useState } from 'react';
import { StatusUpdateForm } from './status-update-form';
import { HistoryRangeFilter } from './history-range-filter';

// AI Summary JSON Structure Type
interface AiSummaryPayload {
    suggestedSpecialty?: string;
    patientEducationSummary?: string;
    structuredSummary?: {
        chiefComplaint?: string;
    };
}

interface AppointmentReason {
    originalText?: string | null;
    aiSummaryJson?: unknown | null; // Added property here
}

export interface AppointmentItem {
    id: string;
    startUtc: Date;
    status: string;
    bookingSubjectType: string;
    patientProfile: {
        user: {
            name: string;
        };
    };
    familyMember?: {
        fullName: string;
    } | null;
    reason?: AppointmentReason | null;
}

interface DoctorDashboardTabsProps {
    upcoming: AppointmentItem[];
    history: AppointmentItem[];
    timeZone: string;
}

export function DoctorDashboardTabs({ upcoming, history, timeZone }: DoctorDashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    // Helper formatted on client-side rendering
    const formatDate = (d: Date) =>
        new Intl.DateTimeFormat('en-IN', { timeZone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));

    return (
        <div className="space-y-6">
            {/* Tab Navigation Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <nav className="flex space-x-2 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/60 w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab('upcoming')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition active:scale-95 ${activeTab === 'upcoming'
                                ? 'bg-white text-teal-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <span>Upcoming</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${activeTab === 'upcoming'
                                    ? 'bg-teal-100 text-teal-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                        >
                            {upcoming.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition active:scale-95 ${activeTab === 'history'
                                ? 'bg-white text-teal-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <span>History</span>
                    </button>
                </nav>

                {/* Show History Range Filter only when History Tab is active */}
                {activeTab === 'history' && (
                    <div className="animate-in fade-in duration-200">
                        <HistoryRangeFilter />
                    </div>
                )}
            </div>

            {/* TAB CONTENT: UPCOMING */}
            {activeTab === 'upcoming' && (
                <section className="space-y-5 animate-in fade-in duration-300">
                    {upcoming.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                No upcoming appointments scheduled.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {upcoming.map((a) => {
                                const aiSummary = a.reason?.aiSummaryJson as AiSummaryPayload | null;

                                return (
                                    <article
                                        key={a.id}
                                        className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-teal-800 font-mono">
                                                    {formatDate(a.startUtc)}
                                                </p>
                                                <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-teal-800 uppercase font-mono">
                                                    {a.status}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                                    Patient
                                                </p>
                                                <p className="text-base font-serif font-bold text-slate-900">
                                                    {a.bookingSubjectType === 'SELF'
                                                        ? a.patientProfile.user.name
                                                        : `${a.familyMember?.fullName} (via ${a.patientProfile.user.name})`}
                                                </p>
                                            </div>

                                            {(a.reason?.originalText || aiSummary) && (
                                                <div className="space-y-2 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                                                    {a.reason?.originalText && (
                                                        <>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                                                Reason
                                                            </p>
                                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                                {a.reason.originalText}
                                                            </p>
                                                        </>
                                                    )}

                                                    {/* AI Summary Collapsible Container */}
                                                    {aiSummary && (
                                                        <details className="group rounded-2xl border border-teal-200/80 bg-teal-50/40 p-3.5 text-xs text-slate-800 transition my-2">
                                                            <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-800 outline-none select-none hover:text-teal-900">
                                                                AI-generated summary (patient-provided)
                                                            </summary>
                                                            <div className="mt-2.5 space-y-2 pt-2.5 border-t border-teal-200/60 leading-relaxed">
                                                                {aiSummary.suggestedSpecialty && (
                                                                    <p>
                                                                        <strong className="font-semibold text-slate-900">Suggested specialty: </strong>
                                                                        {aiSummary.suggestedSpecialty}
                                                                    </p>
                                                                )}
                                                                {aiSummary.patientEducationSummary && (
                                                                    <p className="text-slate-700">
                                                                        {aiSummary.patientEducationSummary}
                                                                    </p>
                                                                )}
                                                                {aiSummary.structuredSummary?.chiefComplaint && (
                                                                    <p className="font-mono text-[11px] text-slate-500">
                                                                        Chief complaint: {aiSummary.structuredSummary.chiefComplaint}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 border-t border-slate-200/60 pt-4">
                                            <StatusUpdateForm
                                                appointmentId={a.id}
                                                currentStatus={a.status}
                                            />
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* TAB CONTENT: HISTORY */}
            {activeTab === 'history' && (
                <section className="space-y-5 animate-in fade-in duration-300">
                    {history.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                No records found for the selected timeframe.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {history.map((a) => {
                                const aiSummary = a.reason?.aiSummaryJson as AiSummaryPayload | null;

                                return (
                                    <article
                                        key={a.id}
                                        className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                                    {formatDate(a.startUtc)}
                                                </p>
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase font-mono ${a.status === 'COMPLETED'
                                                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                                            : a.status === 'CANCELLED'
                                                                ? 'bg-red-50 text-red-700 border border-red-200'
                                                                : a.status === 'NO_SHOW'
                                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                        }`}
                                                >
                                                    {a.status}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                                    Patient
                                                </p>
                                                <p className="text-sm font-serif font-bold text-slate-900">
                                                    {a.bookingSubjectType === 'SELF'
                                                        ? a.patientProfile.user.name
                                                        : `${a.familyMember?.fullName} (via ${a.patientProfile.user.name})`}
                                                </p>
                                            </div>

                                            {(a.reason?.originalText || aiSummary) && (
                                                <div className="space-y-2 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                                                    {a.reason?.originalText && (
                                                        <>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                                                Reason
                                                            </p>
                                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                                {a.reason.originalText}
                                                            </p>
                                                        </>
                                                    )}

                                                    {/* AI Summary Collapsible Container */}
                                                    {aiSummary && (
                                                        <details className="group rounded-2xl border border-teal-200/80 bg-teal-50/40 p-3.5 text-xs text-slate-800 transition my-2">
                                                            <summary className="cursor-pointer font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-800 outline-none select-none hover:text-teal-900">
                                                                AI-generated summary (patient-provided)
                                                            </summary>
                                                            <div className="mt-2.5 space-y-2 pt-2.5 border-t border-teal-200/60 leading-relaxed">
                                                                {aiSummary.suggestedSpecialty && (
                                                                    <p>
                                                                        <strong className="font-semibold text-slate-900">Suggested specialty: </strong>
                                                                        {aiSummary.suggestedSpecialty}
                                                                    </p>
                                                                )}
                                                                {aiSummary.patientEducationSummary && (
                                                                    <p className="text-slate-700">
                                                                        {aiSummary.patientEducationSummary}
                                                                    </p>
                                                                )}
                                                                {aiSummary.structuredSummary?.chiefComplaint && (
                                                                    <p className="font-mono text-[11px] text-slate-500">
                                                                        Chief complaint: {aiSummary.structuredSummary.chiefComplaint}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}