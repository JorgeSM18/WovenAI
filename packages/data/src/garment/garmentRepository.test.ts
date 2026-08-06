import { describe, expect, it } from 'vitest';

import { stripBucket } from './garmentRepository';

describe('stripBucket', () => {
  it('drops the bucket prefix to get the storage key', () => {
    expect(stripBucket('images/u1/original/x.jpg')).toBe('u1/original/x.jpg');
  });

  it('leaves a path without the prefix untouched', () => {
    expect(stripBucket('u1/original/x.jpg')).toBe('u1/original/x.jpg');
  });
});
