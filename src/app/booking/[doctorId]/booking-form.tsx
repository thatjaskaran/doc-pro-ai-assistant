'use client';

import { useState, useEffect } from 'react';
import { createAppointment, addFamilyMember } from './actions';
import { getPendingSummary, clearPendingSummary } from '@/lib/ai/pending-summary';
import type { AiGuidanceResult } from '@/lib/ai/schema';

interface FamilyMember {
    id: string;
    fullName: string;
    relationship: string;
}

interface BookingFormProps {
    doctorId: string;
    slotStartUtc: string;
    familyMembers: FamilyMember[];
}

export function BookingForm({ doctorId, slotStartUtc, familyMembers }: BookingFormProps) {
    const [subjectType, setSubjectType] = useState<'SELF' | 'FAMILY_MEMBER'>('SELF');
    const [showAddFamily, setShowAddFamily] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [addingFamily, setAddingFamily] = useState(false);
    const [pendingSummary, setPendingSummary] = useState<AiGuidanceResult | null>(null);
    const [attachSummary, setAttachSummary] = useState(true);

    // Read once on mount -- sessionStorage is browser-only
    useEffect(() => {
        setPendingSummary(getPendingSummary());
    }, []);

    async function handleSubmit(formData: FormData) {
        setError(null);
        setSubmitting(true);
        formData.set('doctorProfileId', doctorId);
        formData.set('slotStartUtc', slotStartUtc);
        formData.set('bookingSubjectType', subjectType);
        if (pendingSummary && attachSummary) {
            formData.set('aiSummaryJson', JSON.stringify(pendingSummary));
        }
        const result = await createAppointment(formData);
        setSubmitting(false);
        if (result?.error) {
            setError(result.error);
            return;
        }
    }

    async function handleAddFamilyMember(formData: FormData) {
        setError(null);
        setAddingFamily(true);
        const result = await addFamilyMember(formData);
        setAddingFamily(false);
        if (result?.error) {
            setError(result.error);
            return;
        }
        setShowAddFamily(false);
    }

    return (
        <div className="space-y-6">
            {/* AI Summary Banner */}
            {pendingSummary && (
                <section className="space-y-3 rounded-2xl border border-teal-200/80 bg-teal-50/40 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-800">
                            AI Triage Summary Attached
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                clearPendingSummary();
                                setPendingSummary(null);
                            }}
                            className="font-mono text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2 transition"
                        >
                            Discard summary
                        </button>
                    </div>

                    <div className="text-xs font-medium text-slate-800">
                        <strong className="font-serif text-sm font-bold text-slate-900 block mb-0.5">
                            {pendingSummary.suggestedSpecialty}
                        </strong>
                        <p className="leading-relaxed text-slate-700">{pendingSummary.patientEducationSummary}</p>
                    </div>

                    <label className="flex items-start gap-3 pt-1 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={attachSummary}
                            onChange={(e) => setAttachSummary(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-500/20"
                        />
                        <span>Attach this summary to your appointment (the doctor will see it alongside your reason for visit)</span>
                    </label>
                </section>
            )}

            {/* Main Booking Form */}
            <form action={handleSubmit} className="space-y-6">
                {/* Subject Selection Fieldset */}
                <fieldset className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5 space-y-3">
                    <legend className="px-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Who is this appointment for?
                    </legend>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs font-semibold transition ${
                                subjectType === 'SELF'
                                    ? 'border-teal-500 bg-teal-50/50 text-teal-950 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <input
                                type="radio"
                                name="subject"
                                checked={subjectType === 'SELF'}
                                onChange={() => setSubjectType('SELF')}
                                className="h-4 w-4 text-teal-800 focus:ring-teal-500/20"
                            />
                            <span>Myself</span>
                        </label>

                        <label
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs font-semibold transition ${
                                familyMembers.length === 0
                                    ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                                    : subjectType === 'FAMILY_MEMBER'
                                    ? 'border-teal-500 bg-teal-50/50 text-teal-950 shadow-sm'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <input
                                type="radio"
                                name="subject"
                                checked={subjectType === 'FAMILY_MEMBER'}
                                onChange={() => setSubjectType('FAMILY_MEMBER')}
                                disabled={familyMembers.length === 0}
                                className="h-4 w-4 text-teal-800 focus:ring-teal-500/20"
                            />
                            <span>A family member</span>
                        </label>
                    </div>

                    {/* Family Member Select Dropdown */}
                    {subjectType === 'FAMILY_MEMBER' && (
                        <div className="pt-2">
                            <label
                                htmlFor="familyMemberId"
                                className="mb-1.5 block font-mono text-xs font-semibold uppercase tracking-wider text-slate-600"
                            >
                                Select Family Member
                            </label>
                            <select
                                id="familyMemberId"
                                name="familyMemberId"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            >
                                {familyMembers.map((fm) => (
                                    <option key={fm.id} value={fm.id}>
                                        {fm.fullName} ({fm.relationship})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Add Family Toggle Button */}
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={() => setShowAddFamily((v) => !v)}
                            className="font-mono text-xs font-semibold text-teal-800 hover:text-teal-900 underline underline-offset-2 transition"
                        >
                            {showAddFamily ? 'Cancel adding family member' : '+ Add a family member'}
                        </button>
                    </div>
                </fieldset>

                {/* Reason for Visit Textarea */}
                <div>
                    <label
                        htmlFor="reasonText"
                        className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                        What would you like to tell the doctor?
                    </label>
                    <textarea
                        id="reasonText"
                        name="reasonText"
                        required
                        minLength={10}
                        maxLength={2000}
                        rows={4}
                        placeholder="Please describe your symptoms, concerns, or reasons for this visit..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                </div>

                {/* Error Banner */}
                {error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 font-mono text-xs text-rose-800 shadow-sm"
                    >
                        {error}
                    </div>
                )}

                {/* Confirm Appointment Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-teal-800 py-3.5 font-mono text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Booking…
                        </span>
                    ) : (
                        'Confirm Appointment'
                    )}
                </button>
            </form>

            {/* Inline Add Family Member Form Card */}
            {showAddFamily && (
                <form
                    action={handleAddFamilyMember}
                    className="mt-6 space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-sm"
                >
                    <h3 className="font-serif text-lg font-bold text-slate-900">Add Family Member</h3>

                    <div>
                        <label
                            htmlFor="fullName"
                            className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600"
                        >
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="dateOfBirth"
                                className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600"
                            >
                                Date of Birth
                            </label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                name="dateOfBirth"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="relationship"
                                className="mb-1 block font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600"
                            >
                                Relationship
                            </label>
                            <input
                                id="relationship"
                                name="relationship"
                                required
                                placeholder="e.g. Son, Spouse"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={addingFamily}
                        className="w-full rounded-xl bg-slate-900 py-2.5 font-mono text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                        {addingFamily ? 'Saving…' : 'Save Family Member'}
                    </button>
                </form>
            )}
        </div>
    );
}