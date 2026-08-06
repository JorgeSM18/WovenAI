import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { listCategories, listColors } from './referenceRepository';

// Reference data is global and rarely changes; cache it generously.
const STALE_MS = 1000 * 60 * 60;

export function useCategories() {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => listCategories(client),
    staleTime: STALE_MS,
  });
}

export function useColors() {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.colors(),
    queryFn: () => listColors(client),
    staleTime: STALE_MS,
  });
}
