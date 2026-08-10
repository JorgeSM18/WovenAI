export type TripStatus = 'upcoming' | 'active' | 'past';

export type Trip = {
  id: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: TripStatus;
};

export type TripDraft = {
  destination: string;
  startDate: string;
  endDate: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const time = Date.parse(value);
  return !Number.isNaN(time);
}

/** Validates a trip draft. Returns an error message, or null when valid. */
export function validateTripDraft(draft: TripDraft): string | null {
  if (draft.destination.trim().length === 0) return 'Add a destination.';
  if (!isValidDate(draft.startDate)) return 'Start date must be YYYY-MM-DD.';
  if (!isValidDate(draft.endDate)) return 'End date must be YYYY-MM-DD.';
  if (draft.startDate > draft.endDate) return 'End date must be on or after the start date.';
  return null;
}

/** All dates (YYYY-MM-DD) from start to end inclusive; [] if the range is invalid. */
export function enumerateDates(startDate: string, endDate: string): string[] {
  if (!isValidDate(startDate) || !isValidDate(endDate) || startDate > endDate) return [];
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}
