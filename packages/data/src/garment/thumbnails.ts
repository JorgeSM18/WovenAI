import type { WovenClient } from '@woven/api';

const BUCKET = 'images';
const SIGNED_URL_TTL = 60 * 60;

/** Removes the `<bucket>/` prefix from a stored storage_path to get the key. */
export function stripBucket(storagePath: string): string {
  return storagePath.startsWith(`${BUCKET}/`) ? storagePath.slice(BUCKET.length + 1) : storagePath;
}

/** garmentId → signed thumbnail URL, resolving garment → image_asset → Storage.
 *  Batches the Storage signing. RLS scopes the reads to the caller. */
export async function signedThumbnailsByGarment(
  client: WovenClient,
  garmentIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (garmentIds.length === 0) return result;

  const { data: garments, error } = await client
    .from('garment')
    .select('id, original_image_id')
    .in('id', garmentIds);
  if (error) throw error;

  const imageIdByGarment = new Map<string, string>();
  const imageIds: string[] = [];
  for (const garment of garments) {
    if (garment.original_image_id) {
      imageIdByGarment.set(garment.id, garment.original_image_id);
      imageIds.push(garment.original_image_id);
    }
  }
  if (imageIds.length === 0) return result;

  const { data: assets, error: assetError } = await client
    .from('image_asset')
    .select('id, storage_path')
    .in('id', imageIds);
  if (assetError) throw assetError;
  const pathByImage = new Map(assets.map((asset) => [asset.id, stripBucket(asset.storage_path)]));

  const keys = [...new Set(pathByImage.values())];
  const { data: signed } = await client.storage.from(BUCKET).createSignedUrls(keys, SIGNED_URL_TTL);
  const urlByKey = new Map<string, string>();
  for (const entry of signed ?? []) {
    if (entry.path && entry.signedUrl) urlByKey.set(entry.path, entry.signedUrl);
  }

  for (const [garmentId, imageId] of imageIdByGarment) {
    const key = pathByImage.get(imageId);
    const url = key ? urlByKey.get(key) : undefined;
    if (url) result.set(garmentId, url);
  }
  return result;
}
