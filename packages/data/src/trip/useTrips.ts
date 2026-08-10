import type { TripDraft } from '@woven/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { createTrip, listTrips } from './tripRepository';

/** The user's trips. */
export function useTrips(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.trips(userId),
    queryFn: () => listTrips(client),
    enabled: userId.length > 0,
  });
}

/** Creates a trip and refreshes the trip list. */
export function useCreateTrip(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: TripDraft) => createTrip(client, userId, draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.trips(userId) }),
  });
}
