'use client';

import { useState } from 'react';
import { createSpecialty, deleteSpecialty } from './actions';

export function CreateSpecialtyForm() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await createSpecialty(formData);
    setSubmitting(false);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-serif font-bold text-slate-900 mb-4">
        Add New Specialty
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="specialty-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
          >
            Specialty Name
          </label>
          <input
            id="specialty-name"
            name="name"
            required
            minLength={2}
            placeholder="e.g. Cardiology"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
          />
        </div>

        <div>
          <label
            htmlFor="specialty-description"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono"
          >
            Description <span className="font-sans font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="specialty-description"
            name="description"
            placeholder="Brief overview of clinical scope..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 p-3 text-xs font-medium text-red-700"
          >
            <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-teal-800 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add Specialty'}
        </button>
      </div>
    </form>
  );
}

export function DeleteSpecialtyButton({ specialtyId }: { specialtyId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set('specialtyId', specialtyId);
    const result = await deleteSpecialty(formData);
    setSubmitting(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && (
        <p role="alert" className="text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 hover:border-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}