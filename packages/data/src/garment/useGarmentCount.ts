import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { countGarments } from './garmentRepository';

/** Total items in the wardrobe (for the profile stat). */
export function useGarmentCount(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.garmentCount(userId),
    queryFn: () => countGarments(client),
    enabled: userId.length > 0,
  });
}
