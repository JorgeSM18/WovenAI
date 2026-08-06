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
