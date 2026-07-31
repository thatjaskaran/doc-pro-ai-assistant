export const CANCELLATION_WINDOW_HOURS = 2;
export const AUTO_CONFIRM_WINDOW_DAYS = 7;
export const MAX_BOOKING_WINDOW_DAYS = 30;

// Auto-confirm only applies to the week a doctor is actively managing --
// beyond that, their availability that far out is a looser commitment, so
// the booking is held as PENDING until the doctor actively confirms it via
// the existing Confirm/Decline flow (Milestone 5), not a new mechanism.
export function shouldAutoConfirm(startUtc: Date, now: Date = new Date()): boolean {
  const daysUntilAppointment = (startUtc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysUntilAppointment <= AUTO_CONFIRM_WINDOW_DAYS;
}

// Validates a requested date string against [today, today + maxDays] in the
// hospital's calendar -- used to bound the extended date picker so a
// crafted ?date= value can't reach arbitrarily far into the future.
export function isWithinBookingWindow(dateStr: string, todayStr: string, maxDays: number = MAX_BOOKING_WINDOW_DAYS): boolean {
  const todayMs = new Date(`${todayStr}T00:00:00Z`).getTime();
  const targetMs = new Date(`${dateStr}T00:00:00Z`).getTime();
  if (Number.isNaN(targetMs)) return false;
  const diffDays = (targetMs - todayMs) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= maxDays;
}

export function isCancellable(startUtc: Date, now: Date = new Date()): boolean {
  const hoursUntilAppointment = (startUtc.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilAppointment >= CANCELLATION_WINDOW_HOURS;
}