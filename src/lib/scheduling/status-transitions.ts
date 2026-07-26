// src/lib/scheduling/status-transitions.ts
export type AppointmentStatusValue = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// Terminal states (COMPLETED, CANCELLED, NO_SHOW) map to an empty array
// deliberately -- once an appointment reaches one, nothing transitions it
// further. Encoding this here means the rule lives in one place, not
// scattered as ad-hoc if-checks across every action that touches status.
const ALLOWED_TRANSITIONS: Record<AppointmentStatusValue, AppointmentStatusValue[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function isValidStatusTransition(from: AppointmentStatusValue, to: AppointmentStatusValue): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}