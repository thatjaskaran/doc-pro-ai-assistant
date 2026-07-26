import { describe, it, expect } from 'vitest';
import { checkRedFlags,checkTextForRedFlags, RED_FLAG_RULES } from '@/lib/ai/red-flags';

describe('checkRedFlags', () => {
  it('returns null when nothing is selected', () => {
    expect(checkRedFlags([])).toBeNull();
  });

  it('detects chest pain', () => {
    expect(checkRedFlags(['chest_pain'])?.id).toBe('chest_pain');
  });

  it('detects self-harm ideation and includes crisis guidance', () => {
    const match = checkRedFlags(['suicidal_ideation']);
    expect(match?.id).toBe('suicidal_ideation');
    expect(match?.guidance).toMatch(/AASRA|emergency/i);
  });

  it('ignores unrecognized IDs rather than throwing', () => {
    expect(checkRedFlags(['not_a_real_flag'])).toBeNull();
  });

  it('every rule has non-empty guidance text', () => {
    for (const rule of RED_FLAG_RULES) {
      expect(rule.guidance.length).toBeGreaterThan(20);
    }
  });
});

describe('checkTextForRedFlags', () => {
  it('detects chest pain mentioned in free text', () => {
    expect(checkTextForRedFlags('I have really bad chest pain today')?.id).toBe('chest_pain');
  });
  it('returns null for unrelated text', () => {
    expect(checkTextForRedFlags('I feel a bit sleepy and tired')).toBeNull();
  });
  it('is case-insensitive', () => {
    expect(checkTextForRedFlags('CHEST PAIN since this morning')?.id).toBe('chest_pain');
  });
});