import type { Json, WovenClient } from '@woven/api';

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
