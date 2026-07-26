export const CANCELLATION_WINDOW_HOURS = 2;

export function isCancellable(startUtc: Date, now: Date = new Date()): boolean {
  const hoursUntilAppointment = (startUtc.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilAppointment >= CANCELLATION_WINDOW_HOURS;
}