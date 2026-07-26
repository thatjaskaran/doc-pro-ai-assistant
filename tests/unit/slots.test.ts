import { describe, it, expect } from 'vitest';
import { computeSlotsForDate } from '@/lib/scheduling/slots';

const template = {
  dayOfWeek: 1,
  workStart: new Date('1970-01-01T09:00:00Z'),   // 9:00 hospital-local
  workEnd: new Date('1970-01-01T11:00:00Z'),      // 11:00 hospital-local
  breakStart: new Date('1970-01-01T10:00:00Z'),   // 10:00 hospital-local
  breakEnd: new Date('1970-01-01T10:30:00Z'),     // 10:30 hospital-local
  sessionDurationMinutes: 30,
};

describe('computeSlotsForDate', () => {
  const dateStr = '2026-07-13';
  const veryEarly = new Date('2026-01-01T00:00:00.000Z');

  it('generates 30-minute slots across the working window, converted from IST to UTC', () => {
    const slots = computeSlotsForDate(dateStr, template, new Set(), veryEarly);
    // 9:00/9:30/10:30 IST -> 03:30/04:00/05:00 UTC (IST is UTC+5:30)
    expect(slots.map((s) => s.startUtc.toISOString())).toEqual([
      '2026-07-13T03:30:00.000Z',
      '2026-07-13T04:00:00.000Z',
      '2026-07-13T05:00:00.000Z',
    ]);
  });

  it('marks a slot unavailable when its start time is already booked', () => {
    const booked = new Set([new Date('2026-07-13T04:00:00.000Z').getTime()]); // 9:30 IST
    const slots = computeSlotsForDate(dateStr, template, booked, veryEarly);
    const match = slots.find((s) => s.startUtc.toISOString() === '2026-07-13T04:00:00.000Z');
    expect(match?.available).toBe(false);
  });

  it('excludes slots that have already passed', () => {
    const now = new Date('2026-07-13T04:15:00.000Z'); // 9:45 IST
    const slots = computeSlotsForDate(dateStr, template, new Set(), now);
    expect(slots.map((s) => s.startUtc.toISOString())).toEqual(['2026-07-13T05:00:00.000Z']);
  });

  it('returns an empty array when the doctor has no template for that day', () => {
    expect(computeSlotsForDate(dateStr, null, new Set())).toEqual([]);
  });
});