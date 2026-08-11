import type { Database, WovenClient } from '@woven/api';
import type { Season } from '@woven/core';

import { signedThumbnailsByGarment } from './thumbnails';

type GarmentInsert = Database['public']['Tables']['garment']['Insert'];

/** Number of the user's active (non-deleted) garments. RLS scopes to the caller. */
export async function countGarments(client: WovenClient): Promise<number> {
  const { count, error } = await client
    .from('garment')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  if (error) throw error;
  return count ?? 0;
}

export type WardrobeItem = {
  id: string;
  name: string;
  isFavorite: boolean;
  thumbnailUrl: string | null;
};

/** Lists the user's active garments with a signed thumbnail URL (private bucket).
 *  RLS scopes to the caller. */
export async function listGarments(client: WovenClient): Promise<WardrobeItem[]> {
  const { data: garments, error } = await client
    .from('garment')
    .select('id, name, is_favorite')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100); // ponytail: fixed cap; switch to keyset pagination when wardrobes grow
  if (error) throw error;

  const thumbnails = await signedThumbnailsByGarment(
    client,
    garments.map((garment) => garment.id),
  );
  return garments.map((garment) => ({
    id: garment.id,
    name: garment.name,
    isFavorite: garment.is_favorite,
    thumbnailUrl: thumbnails.get(garment.id) ?? null,
  }));
}

/** Toggles the favorite flag. */
export async function setGarmentFavorite(
  client: WovenClient,
  id: string,
  isFavorite: boolean,
): Promise<void> {
  const { error } = await client.from('garment').update({ is_favorite: isFavorite }).eq('id', id);
  if (error) throw error;
}

/** Soft-deletes a garment (marks deleted_at, keeps references) via RPC. */
export async function deleteGarment(client: WovenClient, id: string): Promise<void> {
  const { error } = await client.rpc('soft_delete_garment', { g: id });
  if (error) throw error;
}

/** Records that the garment was worn now (drives Forgotten Pieces). */
export async function markGarmentWorn(client: WovenClient, id: string): Promise<void> {
  const { error } = await client
    .from('garment')
    .update({ last_worn_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

const FORGOTTEN_DAYS = 60;

/** Forgotten pieces (T-0701): garments not worn in >60 days, plus never-worn
 *  ones (no wear tracking yet). Oldest / never-worn first. RLS-scoped. */
export async function listForgottenGarments(client: WovenClient): Promise<WardrobeItem[]> {
  const cutoff = new Date(Date.now() - FORGOTTEN_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: garments, error } = await client
    .from('garment')
    .select('id, name, is_favorite')
    .is('deleted_at', null)
    .or(`last_worn_at.is.null,last_worn_at.lt.${cutoff}`)
    .order('last_worn_at', { ascending: true, nullsFirst: true })
    .limit(12);
  if (error) throw error;

  const thumbnails = await signedThumbnailsByGarment(
    client,
    garments.map((garment) => garment.id),
  );
  return garments.map((garment) => ({
    id: garment.id,
    name: garment.name,
    isFavorite: garment.is_favorite,
    thumbnailUrl: thumbnails.get(garment.id) ?? null,
  }));
}

export type GarmentDetail = {
  id: string;
  name: string;
  season: Season | null;
  status: Database['public']['Enums']['garment_status'];
  isFavorite: boolean;
  categoryName: string;
  colorName: string;
  colorHex: string;
  imageUrl: string | null;
};

/** Full garment view for the detail screen: resolves category/color names and a
 *  signed image URL. RLS scopes access to the owner. */
export async function getGarment(client: WovenClient, id: string): Promise<GarmentDetail> {
  const { data: garment, error } = await client
    .from('garment')
    .select(
      'id, name, season, status, is_favorite, category_id, primary_color_id, original_image_id',
    )
    .eq('id', id)
    .single();
  if (error) throw error;

  const [category, color, thumbnails] = await Promise.all([
    client.from('category').select('name').eq('id', garment.category_id).single(),
    client.from('color').select('name, hex').eq('id', garment.primary_color_id).single(),
    signedThumbnailsByGarment(client, [garment.id]),
  ]);
  if (category.error) throw category.error;
  if (color.error) throw color.error;

  return {
    id: garment.id,
    name: garment.name,
    season: garment.season,
    status: garment.status,
    isFavorite: garment.is_favorite,
    categoryName: category.data.name,
    colorName: color.data.name,
    colorHex: color.data.hex,
    imageUrl: thumbnails.get(garment.id) ?? null,
  };
}

export type CreateGarmentInput = {
  userId: string;
  name: string;
  categoryId: string;
  primaryColorId: string;
  season: Season | null;
  originalImageId: string | null;
};

/** Creates a garment. Without AI processing it goes straight to `active`.
 *  Returns the new garment id. */
export async function createGarment(
  client: WovenClient,
  input: CreateGarmentInput,
): Promise<string> {
  const row: GarmentInsert = {
    user_id: input.userId,
    name: input.name,
    category_id: input.categoryId,
    primary_color_id: input.primaryColorId,
    season: input.season,
    original_image_id: input.originalImageId,
    status: 'active',
  };
  const { data, error } = await client.from('garment').insert(row).select('id').single();
  if (error) throw error;
  return data.id;
}
