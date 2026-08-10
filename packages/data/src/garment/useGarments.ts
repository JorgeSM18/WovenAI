import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { getGarment, listForgottenGarments, listGarments } from './garmentRepository';

/** The user's wardrobe (active garments + signed thumbnails). */
export function useGarments(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.garments(userId),
    queryFn: () => listGarments(client),
    enabled: userId.length > 0,
  });
}

/** Forgotten pieces for the Home carousel (>60 days / never worn). */
export function useForgottenGarments(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.forgottenGarments(userId),
    queryFn: () => listForgottenGarments(client),
    enabled: userId.length > 0,
  });
}

/** A single garment's detail (category/color names + signed image URL). */
export function useGarment(id: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.garment(id),
    queryFn: () => getGarment(client, id),
    enabled: id.length > 0,
  });
}
