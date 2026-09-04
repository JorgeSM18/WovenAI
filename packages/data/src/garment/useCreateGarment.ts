import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { createGarment, type CreateGarmentInput } from './garmentRepository';

/** Creates a garment and refreshes the wardrobe list, count and Home carousel so
 *  the new piece appears immediately (not only after a manual refresh). */
export function useCreateGarment(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGarmentInput) => createGarment(client, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.garments(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.garmentCount(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.forgottenGarments(userId) });
    },
  });
}
