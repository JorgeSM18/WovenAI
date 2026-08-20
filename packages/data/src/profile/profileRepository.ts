import type { Database, WovenClient } from '@woven/api';
import type { Profile, ProfileUpdate } from '@woven/core';

import { stripBucket } from '../garment/thumbnails';

type ProfileRow = Database['public']['Tables']['profile']['Row'];
type ProfileRowUpdate = Database['public']['Tables']['profile']['Update'];

const AVATAR_BUCKET = 'images';
const AVATAR_TTL = 60 * 60;

/** Signed URL for a profile avatar image asset, or null if unavailable.
 *  RLS scopes the asset read to the caller. */
export async function signedAvatarUrl(
  client: WovenClient,
  avatarAssetId: string,
): Promise<string | null> {
  const { data: asset } = await client
    .from('image_asset')
    .select('storage_path')
    .eq('id', avatarAssetId)
    .single();
  if (!asset) return null;
  const { data: signed } = await client.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(stripBucket(asset.storage_path), AVATAR_TTL);
  return signed?.signedUrl ?? null;
}

/** DB row (snake_case) -> domain model. */
export function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    avatarAssetId: row.avatar_asset_id,
    hasCompletedOnboarding: row.has_completed_onboarding,
    viewDensity: row.view_density_pref,
    theme: row.theme_pref,
    units: row.units_pref,
    language: row.language,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Domain patch -> DB update, sending only the fields actually provided. */
export function profileUpdateToRow(patch: ProfileUpdate): ProfileRowUpdate {
  const row: ProfileRowUpdate = {};
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.avatarAssetId !== undefined) row.avatar_asset_id = patch.avatarAssetId;
  if (patch.hasCompletedOnboarding !== undefined) {
    row.has_completed_onboarding = patch.hasCompletedOnboarding;
  }
  if (patch.viewDensity !== undefined) row.view_density_pref = patch.viewDensity;
  if (patch.theme !== undefined) row.theme_pref = patch.theme;
  if (patch.units !== undefined) row.units_pref = patch.units;
  if (patch.language !== undefined) row.language = patch.language;
  return row;
}

export async function getProfile(client: WovenClient, userId: string): Promise<Profile> {
  const { data, error } = await client.from('profile').select('*').eq('id', userId).single();
  if (error) throw error;
  return rowToProfile(data);
}

export async function updateProfile(
  client: WovenClient,
  userId: string,
  patch: ProfileUpdate,
): Promise<Profile> {
  const { data, error } = await client
    .from('profile')
    .update(profileUpdateToRow(patch))
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return rowToProfile(data);
}
