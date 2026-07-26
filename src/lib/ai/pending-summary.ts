import type { AiGuidanceResult } from './schema';

const STORAGE_KEY = 'docpro_pending_ai_summary';

// Deliberately sessionStorage, not localStorage: this should not outlive
// the browser tab, and should never be treated as durable data -- it's a
// transient handoff between pages, not a saved draft.
export function savePendingSummary(summary: AiGuidanceResult): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
}

export function getPendingSummary(): AiGuidanceResult | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AiGuidanceResult;
  } catch {
    return null;
  }
}

export function clearPendingSummary(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}