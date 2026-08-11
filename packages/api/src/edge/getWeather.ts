import { z } from 'zod';

import type { WovenClient } from '../client';

export const weatherSnapshotSchema = z.object({
  date: z.string(),
  temp_c: z.number().nullable(),
  condition: z.string().nullable(),
  location: z.string().nullable(),
});

const getWeatherResultSchema = z.object({ snapshots: z.array(weatherSnapshotSchema) });

export type WeatherSnapshot = z.infer<typeof weatherSnapshotSchema>;

/** Weather for a trip's days via the `get-weather` Edge Function (Open-Meteo). */
export async function getWeather(client: WovenClient, tripId: string): Promise<WeatherSnapshot[]> {
  const { data, error } = await client.functions.invoke('get-weather', {
    body: { trip_id: tripId },
  });
  if (error) throw error;
  return getWeatherResultSchema.parse(data).snapshots;
}
