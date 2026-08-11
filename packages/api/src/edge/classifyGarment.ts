import { z } from 'zod';

import type { WovenClient } from '../client';

export const classificationSchema = z.object({
  categoryName: z.string().nullable(),
  colorName: z.string().nullable(),
  season: z.string().nullable(),
  style: z.array(z.string()),
  confidence: z.number(),
});

export type ClassificationResult = z.infer<typeof classificationSchema>;

/** Suggests garment attributes from its photo via the `classify-garment` Edge
 *  Function (Gemini). Returns an empty/zero-confidence result on AI failure —
 *  never throws for that, so the manual form always works. */
export async function classifyGarment(
  client: WovenClient,
  imageAssetId: string,
): Promise<ClassificationResult> {
  const { data, error } = await client.functions.invoke('classify-garment', {
    body: { image_asset_id: imageAssetId },
  });
  if (error) throw error;
  return classificationSchema.parse(data);
}
