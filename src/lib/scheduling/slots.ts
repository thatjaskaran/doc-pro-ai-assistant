import { addMinutes, isBefore } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

export const HOSPITAL_TIMEZONE = 'Asia/Kolkata';

export interface AvailabilityTemplateRow {
  dayOfWeek: number;
  workStart: Date;
  workEnd: Date;
  breakStart: Date | null;
  breakEnd: Date | null;
  sessionDurationMinutes: number;
}

export interface SlotResult {
  startUtc: Date;
  endUtc: Date;
  available: boolean;
}

function timeOfDayToMinutes(d: Date): number {
  // The stored value's UTC hour/minute components are used purely as a
  // container for a wall-clock time-of-day (e.g. "9:00"). They do NOT
  // represent an actual UTC instant -- that distinction is the entire fix.
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

function localMinutesToUtc(dateStr: string, minutesFromMidnight: number): Date {
  const hh = String(Math.floor(minutesFromMidnight / 60)).padStart(2, '0');
  const mm = String(minutesFromMidnight % 60).padStart(2, '0');
  return fromZonedTime(`${dateStr}T${hh}:${mm}:00`, HOSPITAL_TIMEZONE);
}

export function computeSlotsForDate(
  dateStr: string, // 'YYYY-MM-DD', the hospital-local calendar date being viewed
  template: AvailabilityTemplateRow | undefined | null,
  bookedStartTimes: Set<number>,
  now: Date = new Date(),
): SlotResult[] {
  if (!template) return [];

  const slots: SlotResult[] = [];
  const workStartMin = timeOfDayToMinutes(template.workStart);
  const workEndMin = timeOfDayToMinutes(template.workEnd);
  const breakStartMin = template.breakStart ? timeOfDayToMinutes(template.breakStart) : null;
  const breakEndMin = template.breakEnd ? timeOfDayToMinutes(template.breakEnd) : null;
  const duration = template.sessionDurationMinutes;

  for (let minute = workStartMin; minute + duration <= workEndMin; minute += duration) {
    const overlapsBreak =
      breakStartMin !== null && breakEndMin !== null &&
      minute < breakEndMin && minute + duration > breakStartMin;
    if (overlapsBreak) continue;

    const startUtc = localMinutesToUtc(dateStr, minute);
    if (isBefore(startUtc, now)) continue;

    slots.push({
      startUtc,
      endUtc: addMinutes(startUtc, duration),
      available: !bookedStartTimes.has(startUtc.getTime()),
    });
  }

  return slots;
}