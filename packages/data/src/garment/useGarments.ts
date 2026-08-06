import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { listGarments } from './garmentRepository';

/** The user's wardrobe (active garments + signed thumbnails). */
export function useGarments(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.garments(userId),
    queryFn: () => listGarments(client),
    enabled: userId.length > 0,
  });
}
