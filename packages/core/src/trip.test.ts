import { describe, expect, it } from 'vitest';

import { validateTripDraft } from './trip';

const base = { destination: 'Lisbon', startDate: '2026-09-01', endDate: '2026-09-05' };

describe('validateTripDraft', () => {
  it('accepts a well-formed draft', () => {
    expect(validateTripDraft(base)).toBeNull();
  });

  it('requires a destination', () => {
    expect(validateTripDraft({ ...base, destination: '  ' })).toMatch(/destination/i);
  });

  it('rejects malformed dates', () => {
    expect(validateTripDraft({ ...base, startDate: '01-09-2026' })).toMatch(/start date/i);
    expect(validateTripDraft({ ...base, endDate: '2026-13-40' })).toMatch(/end date/i);
  });

  it('rejects an end date before the start date', () => {
    expect(validateTripDraft({ ...base, startDate: '2026-09-05', endDate: '2026-09-01' })).toMatch(
      /on or after/i,
    );
  });
});
