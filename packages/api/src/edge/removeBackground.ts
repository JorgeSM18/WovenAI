import { z } from 'zod';

import type { WovenClient } from '../client';

const removeBackgroundResultSchema = z.object({ processed_image_id: z.string().uuid() });

/** Removes a garment photo's background via the `remove-background` Edge Function
 *  (self-hosted rembg) and returns the new `processed` image_asset id. The
 *  original photo only reaches your own service, never an external AI (ADR-016). */
export async function removeBackground(client: WovenClient, imageAssetId: string): Promise<string> {
  const { data, error } = await client.functions.invoke('remove-background', {
    body: { image_asset_id: imageAssetId },
  });
  if (error) throw error;
  return removeBackgroundResultSchema.parse(data).processed_image_id;
}
