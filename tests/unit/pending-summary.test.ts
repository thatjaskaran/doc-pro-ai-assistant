import { describe, it, expect, beforeEach } from 'vitest';
import { savePendingSummary, getPendingSummary, clearPendingSummary } from '@/lib/ai/pending-summary';
import type { AiGuidanceResult } from '@/lib/ai/schema';

const sample: AiGuidanceResult = {
  suggestedSpecialty: 'General Medicine',
  urgencyNote: 'Not urgent.',
  patientEducationSummary: 'General info.',
  structuredSummary: { chiefComplaint: 'Fatigue', durationDescription: 'A week', additionalContext: 'None' },
};

describe('pending AI summary sessionStorage helpers', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('returns null when nothing is stored', () => {
    expect(getPendingSummary()).toBeNull();
  });

  it('round-trips a saved summary', () => {
    savePendingSummary(sample);
    expect(getPendingSummary()).toEqual(sample);
  });

  it('clears the stored summary', () => {
    savePendingSummary(sample);
    clearPendingSummary();
    expect(getPendingSummary()).toBeNull();
  });

  it('returns null for corrupted stored JSON rather than throwing', () => {
    window.sessionStorage.setItem('docpro_pending_ai_summary', 'not valid json{{{');
    expect(getPendingSummary()).toBeNull();
  });
});