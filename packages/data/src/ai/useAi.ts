import { classifyGarment, getWeather } from '@woven/api';
import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';

const HOUR = 60 * 60 * 1000;

/** Weather for a trip's days (Open-Meteo via Edge, cached). */
export function useTripWeather(tripId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.tripWeather(tripId),
    queryFn: () => getWeather(client, tripId),
    enabled: tripId.length > 0,
    staleTime: HOUR,
  });
}

/** On-demand AI attribute suggestion for a garment photo (Gemini via Edge). */
export function useClassifyGarment() {
  const client = useSupabaseClient();
  return useMutation({
    mutationFn: (imageAssetId: string) => classifyGarment(client, imageAssetId),
  });
}
