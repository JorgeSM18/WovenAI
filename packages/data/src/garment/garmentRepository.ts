import type { Database, WovenClient } from '@woven/api';
import type { Season } from '@woven/core';

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

const BUCKET = 'images';
const SIGNED_URL_TTL = 60 * 60;

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
    .select('id, name, is_favorite, original_image_id')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100); // ponytail: fixed cap; switch to keyset pagination when wardrobes grow
  if (error) throw error;

  const imageIds = garments
    .map((garment) => garment.original_image_id)
    .filter((id): id is string => id !== null);

  const pathByImageId = new Map<string, string>();
  if (imageIds.length > 0) {
    const { data: assets, error: assetError } = await client
      .from('image_asset')
      .select('id, storage_path')
      .in('id', imageIds);
    if (assetError) throw assetError;
    for (const asset of assets) pathByImageId.set(asset.id, asset.storage_path);
  }

  // storage_path is stored as `images/<key>`; the storage API wants the key.
  const keys = [...new Set(pathByImageId.values())].map((path) => stripBucket(path));
  const urlByKey = new Map<string, string>();
  if (keys.length > 0) {
    const { data: signed } = await client.storage
      .from(BUCKET)
      .createSignedUrls(keys, SIGNED_URL_TTL);
    for (const entry of signed ?? []) {
      if (entry.path && entry.signedUrl) urlByKey.set(entry.path, entry.signedUrl);
    }
  }

  return garments.map((garment) => {
    const path = garment.original_image_id
      ? pathByImageId.get(garment.original_image_id)
      : undefined;
    const key = path ? stripBucket(path) : undefined;
    return {
      id: garment.id,
      name: garment.name,
      isFavorite: garment.is_favorite,
      thumbnailUrl: key ? (urlByKey.get(key) ?? null) : null,
    };
  });
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

/** Removes the `<bucket>/` prefix from a stored storage_path to get the key. */
export function stripBucket(storagePath: string): string {
  return storagePath.startsWith(`${BUCKET}/`) ? storagePath.slice(BUCKET.length + 1) : storagePath;
}

async function signedUrlFor(client: WovenClient, imageId: string | null): Promise<string | null> {
  if (!imageId) return null;
  const { data: asset, error } = await client
    .from('image_asset')
    .select('storage_path')
    .eq('id', imageId)
    .single();
  if (error) throw error;
  const { data: signed } = await client.storage
    .from(BUCKET)
    .createSignedUrl(stripBucket(asset.storage_path), SIGNED_URL_TTL);
  return signed?.signedUrl ?? null;
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

  const [category, color, imageUrl] = await Promise.all([
    client.from('category').select('name').eq('id', garment.category_id).single(),
    client.from('color').select('name, hex').eq('id', garment.primary_color_id).single(),
    signedUrlFor(client, garment.original_image_id),
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
    imageUrl,
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
