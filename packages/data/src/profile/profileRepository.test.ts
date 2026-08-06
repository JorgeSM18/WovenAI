import type { Database } from '@woven/api';
import type { ProfileUpdate } from '@woven/core';
import { describe, expect, it } from 'vitest';

import { profileUpdateToRow, rowToProfile } from './profileRepository';

type ProfileRow = Database['public']['Tables']['profile']['Row'];

const row: ProfileRow = {
  id: 'u1',
  display_name: 'Jo',
  email: 'jo@t.dev',
  avatar_asset_id: null,
  has_completed_onboarding: true,
  view_density_pref: 'compact',
  theme_pref: 'dark',
  units_pref: 'imperial',
  language: 'es-ES',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

describe('rowToProfile', () => {
  it('maps snake_case columns to the camelCase domain model', () => {
    expect(rowToProfile(row)).toEqual({
      id: 'u1',
      displayName: 'Jo',
      email: 'jo@t.dev',
      avatarAssetId: null,
      hasCompletedOnboarding: true,
      viewDensity: 'compact',
      theme: 'dark',
      units: 'imperial',
      language: 'es-ES',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    });
  });
});

describe('profileUpdateToRow', () => {
  it('sends only the provided fields, mapped to columns', () => {
    const patch: ProfileUpdate = { displayName: 'New', theme: 'light' };
    expect(profileUpdateToRow(patch)).toEqual({ display_name: 'New', theme_pref: 'light' });
  });

  it('preserves an explicit null (clearing a value) but omits undefined', () => {
    expect(profileUpdateToRow({ avatarAssetId: null })).toEqual({ avatar_asset_id: null });
    expect(profileUpdateToRow({})).toEqual({});
  });
});
