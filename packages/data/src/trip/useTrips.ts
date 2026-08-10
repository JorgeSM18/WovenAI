import type { TripDraft } from '@woven/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import {
  addTripGarment,
  assignOutfitToDay,
  createTrip,
  getTrip,
  getTripDays,
  listTripGarments,
  listTrips,
  removeTripGarment,
} from './tripRepository';

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

export function useTrip(id: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.trip(id),
    queryFn: () => getTrip(client, id),
    enabled: id.length > 0,
  });
}

export function useTripGarments(tripId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.tripGarments(tripId),
    queryFn: () => listTripGarments(client, tripId),
    enabled: tripId.length > 0,
  });
}

/** Adds or removes a garment from the trip's packing list. */
export function useToggleTripGarment(tripId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ garmentId, packed }: { garmentId: string; packed: boolean }) =>
      packed
        ? removeTripGarment(client, tripId, garmentId)
        : addTripGarment(client, tripId, garmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tripGarments(tripId) }),
  });
}

export function useTripDays(tripId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.tripDays(tripId),
    queryFn: () => getTripDays(client, tripId),
    enabled: tripId.length > 0,
  });
}

export function useAssignOutfitToDay(tripId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: string; outfitId: string }) =>
      assignOutfitToDay(client, { tripId, date: input.date, outfitId: input.outfitId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tripDays(tripId) }),
  });
}
