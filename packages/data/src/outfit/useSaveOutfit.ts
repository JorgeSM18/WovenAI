import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { saveOutfit, type CreateOutfitInput } from './outfitRepository';

/** Saves an outfit (transactional RPC) and refreshes the outfit list. */
export function useSaveOutfit(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOutfitInput) => saveOutfit(client, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.outfits(userId) }),
  });
}
