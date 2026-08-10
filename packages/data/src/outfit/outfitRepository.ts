import type { Json, WovenClient } from '@woven/api';

const BUCKET = 'images';
const SIGNED_URL_TTL = 60 * 60;

function stripBucket(storagePath: string): string {
  return storagePath.startsWith(`${BUCKET}/`) ? storagePath.slice(BUCKET.length + 1) : storagePath;
}

export type OutfitItemInput = {
  garmentId: string;
  zIndex: number;
  posX?: number;
  posY?: number;
  rotation?: number;
  scale?: number;
};

export type CreateOutfitInput = {
  name: string;
  items: OutfitItemInput[];
};

/** Saves an outfit and its items atomically via the `save_outfit` RPC, which
 *  validates ≥1 item and that every garment belongs to the caller. */
export type OutfitSummary = {
  id: string;
  name: string;
};

/** Lists the user's outfits (most recent first). RLS scopes to the caller. */
export async function listOutfits(client: WovenClient): Promise<OutfitSummary[]> {
  const { data, error } = await client
    .from('outfit')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data.map((outfit) => ({ id: outfit.id, name: outfit.name ?? 'Untitled outfit' }));
}

export type OutfitItemView = {
  garmentId: string;
  thumbnailUrl: string | null;
  posX: number;
  posY: number;
  zIndex: number;
  rotation: number;
  scale: number;
};

export type OutfitDetail = {
  id: string;
  name: string;
  items: OutfitItemView[];
};

/** Full outfit for the detail screen: items with positions/transforms and a
 *  signed thumbnail per garment. RLS scopes access to the owner. */
export async function getOutfit(client: WovenClient, id: string): Promise<OutfitDetail> {
  const { data: outfit, error } = await client
    .from('outfit')
    .select('id, name')
    .eq('id', id)
    .single();
  if (error) throw error;

  const { data: rows, error: itemsError } = await client
    .from('outfit_item')
    .select('garment_id, pos_x, pos_y, z_index, rotation, scale')
    .eq('outfit_id', id)
    .order('z_index', { ascending: true });
  if (itemsError) throw itemsError;

  const thumbnailByGarment = await signedThumbnails(
    client,
    rows.map((row) => row.garment_id),
  );

  return {
    id: outfit.id,
    name: outfit.name ?? 'Untitled outfit',
    items: rows.map((row) => ({
      garmentId: row.garment_id,
      thumbnailUrl: thumbnailByGarment.get(row.garment_id) ?? null,
      posX: Number(row.pos_x),
      posY: Number(row.pos_y),
      zIndex: row.z_index,
      rotation: Number(row.rotation),
      scale: Number(row.scale),
    })),
  };
}

/** garmentId → signed thumbnail URL, resolving garment → image_asset → Storage. */
async function signedThumbnails(
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

export async function saveOutfit(client: WovenClient, input: CreateOutfitInput): Promise<string> {
  const items: Json = input.items.map((item) => ({
    garment_id: item.garmentId,
    pos_x: item.posX ?? 0,
    pos_y: item.posY ?? 0,
    z_index: item.zIndex,
    rotation: item.rotation ?? 0,
    scale: item.scale ?? 1,
  }));
  const { data, error } = await client.rpc('save_outfit', { name: input.name, items });
  if (error) throw error;
  return data;
}
