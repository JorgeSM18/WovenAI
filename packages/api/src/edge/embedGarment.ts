import { z } from 'zod';

import type { WovenClient } from '../client';

const embedGarmentResultSchema = z.object({ garment_id: z.string().uuid() });

/** Generates and stores a garment's text embedding via the `embed-garment` Edge
 *  Function (Nomic). Only metadata is embedded, never the photo (ADR-016). */
export async function embedGarment(client: WovenClient, garmentId: string): Promise<void> {
  const { data, error } = await client.functions.invoke('embed-garment', {
    body: { garment_id: garmentId },
  });
  if (error) throw error;
  embedGarmentResultSchema.parse(data);
}
