import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { createGarment, type CreateGarmentInput } from './garmentRepository';

/** Creates a garment and refreshes the wardrobe count (Total Items). */
export function useCreateGarment(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGarmentInput) => createGarment(client, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.garmentCount(userId) }),
  });
}
