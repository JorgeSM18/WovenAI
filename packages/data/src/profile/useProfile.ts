import type { Profile, ProfileUpdate } from '@woven/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { getProfile, updateProfile } from './profileRepository';

/** Reads the current user's profile. Disabled until a userId is known. */
export function useProfile(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => getProfile(client, userId),
    enabled: userId.length > 0,
  });
}

/** Updates the profile with an optimistic cache write and rollback on error. */
export function useUpdateProfile(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  const key = queryKeys.profile(userId);

  return useMutation({
    mutationFn: (patch: ProfileUpdate) => updateProfile(client, userId, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Profile>(key);
      if (previous) {
        queryClient.setQueryData<Profile>(key, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
