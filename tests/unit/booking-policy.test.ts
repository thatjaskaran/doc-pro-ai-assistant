import { describe, it, expect } from 'vitest';
import { shouldAutoConfirm, isWithinBookingWindow, AUTO_CONFIRM_WINDOW_DAYS, MAX_BOOKING_WINDOW_DAYS } from '@/lib/scheduling/policy';

describe('shouldAutoConfirm', () => {
  const now = new Date('2026-07-27T00:00:00Z');

  it('auto-confirms a slot within the default window', () => {
    expect(shouldAutoConfirm(new Date(now.getTime() + 3 * 86400000), now)).toBe(true);
  });
  it('does not auto-confirm a slot beyond the default window', () => {
    expect(shouldAutoConfirm(new Date(now.getTime() + 15 * 86400000), now)).toBe(false);
  });
  it('treats the boundary day itself as auto-confirmable', () => {
    expect(shouldAutoConfirm(new Date(now.getTime() + AUTO_CONFIRM_WINDOW_DAYS * 86400000), now)).toBe(true);
  });
});

describe('isWithinBookingWindow', () => {
  const today = '2026-07-27';

  it('accepts today', () => {
    expect(isWithinBookingWindow(today, today)).toBe(true);
  });
  it('accepts the max-day boundary', () => {
    expect(isWithinBookingWindow('2026-08-26', today, MAX_BOOKING_WINDOW_DAYS)).toBe(true);
  });
  it('rejects a date beyond the max window', () => {
    expect(isWithinBookingWindow('2026-09-27', today, MAX_BOOKING_WINDOW_DAYS)).toBe(false);
  });
  it('rejects a date in the past', () => {
    expect(isWithinBookingWindow('2026-07-01', today)).toBe(false);
  });
  it('rejects malformed input rather than throwing', () => {
    expect(isWithinBookingWindow('not-a-date', today)).toBe(false);
  });
});