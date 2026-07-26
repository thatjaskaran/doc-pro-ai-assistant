'use client';

import { useState } from 'react';
import { submitRating } from './actions';

export function RatingForm({ appointmentId }: { appointmentId: string }) {
  const [score, setScore] = useState(5);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set('appointmentId', appointmentId);
    formData.set('score', String(score));
    if (comment.trim()) formData.set('comment', comment.trim());

    const result = await submitRating(formData);
    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-center">
        <p className="text-xs font-semibold text-emerald-800 font-mono">
          ✓ Thank you! Your feedback has been recorded.
        </p>
      </div>
    );
  }

  const activeScore = hoveredScore ?? score;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating Picker */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
          Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              onMouseEnter={() => setHoveredScore(star)}
              onMouseLeave={() => setHoveredScore(null)}
              className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <span
                className={
                  star <= activeScore ? 'text-amber-400' : 'text-slate-200'
                }
              >
                ★
              </span>
            </button>
          ))}
          <span className="ml-2 text-xs font-semibold text-slate-600 font-mono">
            {activeScore} / 5
          </span>
        </div>
      </div>

      {/* Optional Comment Input */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            Comment <span className="text-slate-400 font-sans lowercase">(optional)</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {comment.length}/500
          </span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Share your experience regarding the consultation..."
          className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700 placeholder:text-slate-400 leading-relaxed resize-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-2xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Rating'}
      </button>
    </form>
  );
}