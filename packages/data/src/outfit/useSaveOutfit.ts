import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { getOutfit, listOutfits, saveOutfit, type CreateOutfitInput } from './outfitRepository';

/** Saves an outfit (transactional RPC) and refreshes the outfit list. */
export function useSaveOutfit(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOutfitInput) => saveOutfit(client, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.outfits(userId) }),
  });
}

/** The user's saved outfits. */
export function useOutfits(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.outfits(userId),
    queryFn: () => listOutfits(client),
    enabled: userId.length > 0,
  });
}

/** A single outfit's composition (items with positions + thumbnails). */
export function useOutfit(id: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.outfit(id),
    queryFn: () => getOutfit(client, id),
    enabled: id.length > 0,
  });
}
