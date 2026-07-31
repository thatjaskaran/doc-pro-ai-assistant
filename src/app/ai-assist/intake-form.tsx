'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RED_FLAG_RULES } from '@/lib/ai/red-flags';
import { savePendingSummary } from '@/lib/ai/pending-summary';
import type { AiGuidanceResult } from '@/lib/ai/schema';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SuggestedDoctor {
  id: string;
  ratingAverage: unknown;
  ratingCount: number;
  user: { name: string };
}

export function IntakeForm() {
  const router = useRouter();
  const [stage, setStage] = useState<'chat' | 'results'>('chat');
  
  // Modal Visibility States
  const [showScreeningModal, setShowScreeningModal] = useState(true);
  const [showRedFlagModal, setShowRedFlagModal] = useState(false);

  const [checkedFlags, setCheckedFlags] = useState<string[]>([]);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [redFlagGuidance, setRedFlagGuidance] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi — I'm here to help point you toward the right kind of care. What's been going on?",
    },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiGuidanceResult | null>(null);
  const [suggestedDoctors, setSuggestedDoctors] = useState<SuggestedDoctor[]>([]);

  // Ref for the scrollable container
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll scoped ONLY to the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, sending]);

  function toggleFlag(id: string) {
    setCheckedFlags((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleScreeningSubmit(e: React.FormEvent) {
    e.preventDefault();
    setScreeningLoading(true);
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'screen', redFlagIds: checkedFlags }),
      });
      const data = await res.json();
      
      setShowScreeningModal(false);

      if (data.redFlag) {
        setRedFlagGuidance(data.guidance);
        setShowRedFlagModal(true);
        return;
      }
    } catch {
      setError('An unexpected error occurred during screening.');
      setShowScreeningModal(false);
    } finally {
      setScreeningLoading(false);
    }
  }

  async function sendMessage() {
    if (!draft.trim() || sending) return;
    const userMessage: ChatMessage = { role: 'user', content: draft.trim() };
    const historyBeforeThisMessage = messages;
    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          message: userMessage.content,
          history: historyBeforeThisMessage,
        }),
      });
      const data = await res.json();

      if (data.redFlag) {
        setRedFlagGuidance(data.guidance);
        setShowRedFlagModal(true);
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function handleGetSummary() {
    setSummaryLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'summary', history: messages }),
      });
      const data = await res.json();

      if (data.redFlag) {
        setRedFlagGuidance(data.guidance);
        setShowRedFlagModal(true);
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      setResult(data.result);
      setSuggestedDoctors(data.suggestedDoctors);
      setStage('results');
    } catch {
      setError('Failed to generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  }

  function handleBookWithDoctor(doctorId: string) {
    if (result) savePendingSummary(result);
    router.push(`/doctors/${doctorId}`);
  }

  return (
    <>
      {/* 1. INITIAL SCREENING POPUP MODAL */}
      {showScreeningModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close / Dismiss Button */}
            <button
              type="button"
              onClick={() => setShowScreeningModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              aria-label="Skip screening"
            >
              ✕
            </button>

            <form onSubmit={handleScreeningSubmit} className="space-y-6">
              <fieldset className="space-y-4">
                <legend className="pr-8 text-base font-serif font-bold text-slate-900 leading-snug">
                  Before we start, are you experiencing any of the following right now?
                </legend>
                <div className="space-y-2.5 pt-2">
                  {RED_FLAG_RULES.map((rule) => {
                    const isChecked = checkedFlags.includes(rule.id);
                    return (
                      <label
                        key={rule.id}
                        className={`flex items-start gap-3 rounded-2xl border p-4 transition cursor-pointer select-none ${
                          isChecked
                            ? 'border-red-300 bg-red-50/50 text-red-950'
                            : 'border-slate-200/80 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFlag(rule.id)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 focus:ring-offset-0"
                        />
                        <span className="text-xs sm:text-sm font-medium leading-relaxed">
                          {rule.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={screeningLoading}
                  className="w-full inline-flex justify-center items-center rounded-xl bg-teal-800 px-5 py-3 text-xs font-semibold tracking-wide text-white transition hover:bg-teal-900 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {screeningLoading ? 'Checking safety guidelines…' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. RED FLAG WARNING POPUP MODAL */}
      {showRedFlagModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-red-200 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close / Cross Button */}
            <button
              type="button"
              onClick={() => setShowRedFlagModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              aria-label="Close warning"
            >
              ✕
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-center text-xl font-serif font-bold text-red-950">
              Please Seek Care Immediately
            </h2>

            <p className="mt-3 text-center text-sm leading-relaxed text-red-800">
              {redFlagGuidance}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowRedFlagModal(false)}
                className="w-full rounded-xl bg-red-700 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-red-800 active:scale-95"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: GUIDANCE & DOCTOR RESULTS */}
      {stage === 'results' && result && (
        <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
          {/* Guidance Summary Card */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-serif font-bold text-slate-900">AI Care Guidance</h2>
              <span className="rounded-full bg-teal-50 px-3 py-1 font-mono text-xs font-semibold text-teal-800 border border-teal-200">
                {result.suggestedSpecialty}
              </span>
            </div>

            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <p className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">{result.patientEducationSummary}</p>
              {result.urgencyNote && (
                <p className="text-xs text-amber-900 font-medium bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                  ⚠️ {result.urgencyNote}
                </p>
              )}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Standard Disclaimer: This provided information is general and not a medical diagnosis. Always consult a certified healthcare professional for medical concerns.
            </p>
          </section>

          {/* Doctor Recommendations */}
          <section className="space-y-4">
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-slate-500">
              Suggested Specialists
            </h3>

            {suggestedDoctors.length === 0 ? (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">No approved doctors currently listed for this specialty.</p>
                <Link href="/doctors" className="inline-block text-xs font-semibold text-teal-800 hover:underline">
                  Browse all available doctors →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {suggestedDoctors.map((doctor) => (
                  <article
                    key={doctor.id}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300"
                  >
                    <div className="space-y-1">
                      <p className="text-base font-serif font-bold text-slate-900">{doctor.user.name}</p>
                      <p className="text-xs text-amber-600 font-medium">
                        {doctor.ratingCount > 0
                          ? `★ ${Number(doctor.ratingAverage).toFixed(1)} (${doctor.ratingCount} reviews)`
                          : 'No reviews yet'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBookWithDoctor(doctor.id)}
                      className="mt-5 w-full rounded-xl bg-teal-800 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-900 active:scale-95"
                    >
                      Book with {doctor.user.name}
                    </button>
                  </article>
                ))}
              </div>
            )}

            <div className="text-center pt-2">
              <Link href="/doctors" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
                Or browse all doctors →
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* STAGE: INTERACTIVE CHAT STAGE */}
      {stage === 'chat' && (
        <div className="mx-auto max-w-2xl space-y-4 animate-in fade-in duration-300">
          {/* Messages Window with overscroll-contain and scoped ref */}
          <div
            ref={chatContainerRef}
            className="h-[420px] overflow-y-auto overscroll-contain rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm space-y-4"
          >
            {messages.map((m, i) => {
              const isUser = m.role === 'user';
              return (
                <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <span className="mb-1 text-[10px] font-mono font-semibold uppercase text-slate-400">
                    {isUser ? 'You' : 'Assistant'}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-teal-800 text-white rounded-br-none'
                        : 'bg-slate-100/80 text-slate-800 rounded-bl-none border border-slate-200/50'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex flex-col items-start">
                <span className="mb-1 text-[10px] font-mono font-semibold uppercase text-slate-400">Assistant</span>
                <div className="rounded-2xl rounded-bl-none bg-slate-100/80 border border-slate-200/50 px-4 py-3 text-xs text-slate-500 animate-pulse">
                  Assistant is thinking…
                </div>
              </div>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Input controls */}
          <div className="space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your response here…"
                maxLength={1000}
                className="flex-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-teal-700 focus:ring-1 focus:ring-teal-700 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="rounded-2xl bg-teal-800 px-5 py-3 text-xs font-semibold text-white transition hover:bg-teal-900 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                Send
              </button>
            </form>

            <button
              type="button"
              onClick={handleGetSummary}
              disabled={summaryLoading || messages.filter((m) => m.role === 'user').length === 0}
              className="w-full rounded-2xl border border-teal-200/80 bg-teal-50/50 px-4 py-3 text-xs font-semibold tracking-wide text-teal-900 transition hover:bg-teal-100/60 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {summaryLoading ? 'Generating summary & finding specialists…' : 'Get Guidance & Doctor Suggestions'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}