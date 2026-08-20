import type { Json, WovenClient } from '@woven/api';

import { signedThumbnailsByGarment } from '../garment/thumbnails';

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
  /** Up to 4 garment thumbnails (lowest z-index first) for a cover mosaic. */
  previewUrls: string[];
};

/** Lists the user's outfits (most recent first) with a few garment thumbnails
 *  each for a cover mosaic. RLS scopes to the caller. */
export async function listOutfits(client: WovenClient): Promise<OutfitSummary[]> {
  const { data, error } = await client
    .from('outfit')
    .select('id, name, outfit_item(garment_id, z_index)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;

  const garmentIdsByOutfit = new Map<string, string[]>();
  const allGarmentIds: string[] = [];
  for (const outfit of data) {
    const ids = [...outfit.outfit_item]
      .sort((a, b) => a.z_index - b.z_index)
      .slice(0, 4)
      .map((item) => item.garment_id);
    garmentIdsByOutfit.set(outfit.id, ids);
    allGarmentIds.push(...ids);
  }

  const thumbnailByGarment = await signedThumbnailsByGarment(client, [...new Set(allGarmentIds)]);

  return data.map((outfit) => ({
    id: outfit.id,
    name: outfit.name ?? 'Untitled outfit',
    previewUrls: (garmentIdsByOutfit.get(outfit.id) ?? [])
      .map((garmentId) => thumbnailByGarment.get(garmentId))
      .filter((url): url is string => Boolean(url)),
  }));
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

  const thumbnailByGarment = await signedThumbnailsByGarment(
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
