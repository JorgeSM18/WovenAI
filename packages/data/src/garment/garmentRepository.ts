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
  thumbnailUrl: string | null;
};

/** Lists the user's active garments with a signed thumbnail URL (private bucket).
 *  RLS scopes to the caller. */
export async function listGarments(client: WovenClient): Promise<WardrobeItem[]> {
  const { data: garments, error } = await client
    .from('garment')
    .select('id, name, original_image_id')
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
      thumbnailUrl: key ? (urlByKey.get(key) ?? null) : null,
    };
  });
}

/** Removes the `<bucket>/` prefix from a stored storage_path to get the key. */
export function stripBucket(storagePath: string): string {
  return storagePath.startsWith(`${BUCKET}/`) ? storagePath.slice(BUCKET.length + 1) : storagePath;
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
