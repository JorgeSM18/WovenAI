import { z } from 'zod';

import type { WovenClient } from '../client';

export const outfitRecommendationSchema = z.object({
  /** 0..100 cohesion score, or null when the AI is unavailable. */
  matchScore: z.number().nullable(),
  suggestions: z.array(z.string()),
  conflicts: z.array(z.string()),
});

export type OutfitRecommendation = z.infer<typeof outfitRecommendationSchema>;

/** Scores how well a set of garments work together via the `recommend-outfit`
 *  Edge Function (Gemini). Only metadata is sent, never photos (ADR-016).
 *  Returns a null score on AI failure — never throws for that. */
export async function recommendOutfit(
  client: WovenClient,
  garmentIds: string[],
): Promise<OutfitRecommendation> {
  const { data, error } = await client.functions.invoke('recommend-outfit', {
    body: { garment_ids: garmentIds },
  });
  if (error) throw error;
  return outfitRecommendationSchema.parse(data);
}
