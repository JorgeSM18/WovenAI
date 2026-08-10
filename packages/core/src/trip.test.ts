import { describe, expect, it } from 'vitest';

import { enumerateDates, validateTripDraft } from './trip';

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

describe('enumerateDates', () => {
  it('lists dates inclusive, crossing a month boundary', () => {
    expect(enumerateDates('2026-09-29', '2026-10-02')).toEqual([
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });

  it('returns a single day when start equals end', () => {
    expect(enumerateDates('2026-09-01', '2026-09-01')).toEqual(['2026-09-01']);
  });

  it('returns [] for an inverted or invalid range', () => {
    expect(enumerateDates('2026-09-05', '2026-09-01')).toEqual([]);
    expect(enumerateDates('bad', '2026-09-01')).toEqual([]);
  });
});
