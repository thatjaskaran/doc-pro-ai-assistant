import { describe, it, expect } from 'vitest';
import { isValidStatusTransition } from '@/lib/scheduling/status-transitions';

describe('isValidStatusTransition', () => {
  it('allows PENDING -> CONFIRMED', () => {
    expect(isValidStatusTransition('PENDING', 'CONFIRMED')).toBe(true);
  });
  it('rejects PENDING -> COMPLETED (must be confirmed first)', () => {
    expect(isValidStatusTransition('PENDING', 'COMPLETED')).toBe(false);
  });
  it('allows CONFIRMED -> NO_SHOW', () => {
    expect(isValidStatusTransition('CONFIRMED', 'NO_SHOW')).toBe(true);
  });
  it('rejects any transition out of a terminal state', () => {
    expect(isValidStatusTransition('COMPLETED', 'CONFIRMED')).toBe(false);
    expect(isValidStatusTransition('CANCELLED', 'PENDING')).toBe(false);
  });
});