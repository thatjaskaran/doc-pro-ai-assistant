'use client';

import { useState } from 'react';
import { reviewDoctorApplication } from './actions';

export function ReviewForm({ doctorProfileId, currentStatus }: { doctorProfileId: string; currentStatus: string }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleDecision(decision: 'APPROVED' | 'REJECTED') {
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set('doctorProfileId', doctorProfileId);
    formData.set('decision', decision);
    if (note) formData.set('reviewNote', note);
    const result = await reviewDoctorApplication(formData);
    setSubmitting(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-serif font-bold text-slate-900 mb-4">
        Application Decision
      </h3>

      {currentStatus !== 'REJECTED' && (
        <div className="mb-5">
          <label 
            htmlFor="review-note" 
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
          >
            Review Note <span className="font-sans font-normal text-slate-400">(optional, visible on rejection)</span>
          </label>
          <input
            id="review-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder="Add internal feedback or reason for rejection..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
          />
        </div>
      )}

      {error && (
        <div 
          role="alert" 
          className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs font-medium text-red-700"
        >
          <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {currentStatus !== 'APPROVED' && (
          <button
            type="button"
            onClick={() => handleDecision('APPROVED')}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Approve Doctor'}
          </button>
        )}

        {currentStatus !== 'REJECTED' && (
          <button
            type="button"
            onClick={() => handleDecision('REJECTED')}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-5 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Reject Application'}
          </button>
        )}
      </div>
    </div>
  );
}