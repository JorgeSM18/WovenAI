import type { StylePreference } from '@woven/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import {
  addStylePreference,
  listStylePreferences,
  removeStylePreference,
} from './stylePreferenceRepository';

export function useStylePreferences(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.stylePreferences(userId),
    queryFn: () => listStylePreferences(client),
    enabled: userId.length > 0,
  });
}

/** Adds a tag with an optimistic insert (temp id until the server responds). */
export function useAddStylePreference(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  const key = queryKeys.stylePreferences(userId);

  return useMutation({
    mutationFn: (tag: string) => addStylePreference(client, userId, tag),
    onMutate: async (tag) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<StylePreference[]>(key);
      queryClient.setQueryData<StylePreference[]>(key, [
        ...(previous ?? []),
        { id: `temp-${tag}`, tag },
      ]);
      return { previous };
    },
    onError: (_error, _tag, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** Removes a tag by id with an optimistic delete and rollback on error. */
export function useRemoveStylePreference(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  const key = queryKeys.stylePreferences(userId);

  return useMutation({
    mutationFn: (id: string) => removeStylePreference(client, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<StylePreference[]>(key);
      queryClient.setQueryData<StylePreference[]>(
        key,
        (previous ?? []).filter((pref) => pref.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
