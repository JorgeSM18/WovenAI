import { describe, expect, it } from 'vitest';

import { classificationSchema } from './classifyGarment';
import { weatherSnapshotSchema } from './getWeather';

describe('classificationSchema', () => {
  it('accepts a full suggestion and an empty one', () => {
    expect(
      classificationSchema.parse({
        categoryName: 'Tops',
        colorName: 'Navy',
        season: 'summer',
        style: ['minimalist'],
        confidence: 0.82,
      }).categoryName,
    ).toBe('Tops');
    expect(
      classificationSchema.parse({
        categoryName: null,
        colorName: null,
        season: null,
        style: [],
        confidence: 0,
      }).confidence,
    ).toBe(0);
  });

  it('rejects a malformed payload', () => {
    expect(() => classificationSchema.parse({ categoryName: 'Tops' })).toThrow();
  });
});

describe('weatherSnapshotSchema', () => {
  it('accepts a snapshot with a null temperature', () => {
    expect(
      weatherSnapshotSchema.parse({
        date: '2026-09-01',
        temp_c: null,
        condition: 'Rain',
        location: 'Lisbon',
      }).condition,
    ).toBe('Rain');
  });
});
