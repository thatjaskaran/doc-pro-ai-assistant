import { describe, it, expect } from 'vitest';
import { containsBannedContent, type AiGuidanceResult } from '@/lib/ai/schema';

const baseResult: AiGuidanceResult = {
  suggestedSpecialty: 'General Medicine',
  urgencyNote: 'This does not appear urgent.',
  patientEducationSummary: 'General fatigue can have many common causes.',
  structuredSummary: {
    chiefComplaint: 'Fatigue',
    durationDescription: 'About a week',
    additionalContext: 'No other symptoms mentioned.',
  },
};

describe('containsBannedContent', () => {
  it('allows clean, compliant output', () => {
    expect(containsBannedContent(baseResult)).toBe(false);
  });

  it('flags a dosage mention', () => {
    const result = { ...baseResult, patientEducationSummary: 'Take 500 mg as needed.' };
    expect(containsBannedContent(result)).toBe(true);
  });

  it('flags a diagnostic claim', () => {
    const result = { ...baseResult, urgencyNote: 'You have a mild infection.' };
    expect(containsBannedContent(result)).toBe(true);
  });

  it('flags a ruled-out claim', () => {
    const result = { ...baseResult, patientEducationSummary: 'Serious conditions have been ruled out.' };
    expect(containsBannedContent(result)).toBe(true);
  });
});