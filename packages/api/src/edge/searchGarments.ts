import { z } from 'zod';

import type { WovenClient } from '../client';

export const garmentMatchSchema = z.object({
  id: z.string().uuid(),
  similarity: z.number(),
});

const searchResultSchema = z.object({ results: z.array(garmentMatchSchema) });

export type GarmentMatch = z.infer<typeof garmentMatchSchema>;

/** Semantic wardrobe search via the `search-garments` Edge Function: embeds the
 *  query (Nomic) and ranks the caller's garments by cosine similarity. */
export async function searchGarments(
  client: WovenClient,
  query: string,
  matchCount?: number,
): Promise<GarmentMatch[]> {
  const { data, error } = await client.functions.invoke('search-garments', {
    body: { query, match_count: matchCount },
  });
  if (error) throw error;
  return searchResultSchema.parse(data).results;
}
