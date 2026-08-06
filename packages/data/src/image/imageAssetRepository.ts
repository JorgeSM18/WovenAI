import type { Database, WovenClient } from '@woven/api';

type ImageAssetInsert = Database['public']['Tables']['image_asset']['Insert'];
export type ImageType = Database['public']['Enums']['image_type'];

export type NewImageAsset = {
  userId: string;
  storagePath: string;
  type: ImageType;
  width: number;
  height: number;
  mime: string;
  bytes: number;
};

/** Records an uploaded image's metadata. Returns the new image_asset id. */
export async function createImageAsset(client: WovenClient, input: NewImageAsset): Promise<string> {
  const row: ImageAssetInsert = {
    user_id: input.userId,
    storage_path: input.storagePath,
    type: input.type,
    width: input.width,
    height: input.height,
    mime: input.mime,
    bytes: input.bytes,
  };
  const { data, error } = await client.from('image_asset').insert(row).select('id').single();
  if (error) throw error;
  return data.id;
}
