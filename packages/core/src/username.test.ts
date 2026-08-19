import { describe, expect, it } from 'vitest';

import { generateUsername } from './username';

describe('generateUsername', () => {
  it('produces a lowercase word-number handle', () => {
    expect(generateUsername(() => 0)).toMatch(/^[a-z]+-\d{4}$/);
  });

  it('varies with the random source', () => {
    expect(generateUsername(() => 0)).not.toBe(generateUsername(() => 0.99));
  });
});
