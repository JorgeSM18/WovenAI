import { deleteAccount } from '@woven/api';
import type { Profile, ProfileUpdate } from '@woven/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import { getProfile, signedAvatarUrl, updateProfile } from './profileRepository';

/** Reads the current user's profile. Disabled until a userId is known. */
export function useProfile(userId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => getProfile(client, userId),
    enabled: userId.length > 0,
  });
}

/** Permanently deletes the account and all its data (irreversible). Caller
 *  should sign out on success — the session is invalid afterwards. */
export function useDeleteAccount() {
  const client = useSupabaseClient();
  return useMutation({ mutationFn: () => deleteAccount(client) });
}

/** Resolves a signed URL for the profile avatar. Disabled until an asset id exists. */
export function useAvatarUrl(avatarAssetId: string | null) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: queryKeys.avatarUrl(avatarAssetId ?? ''),
    queryFn: () => (avatarAssetId ? signedAvatarUrl(client, avatarAssetId) : null),
    enabled: Boolean(avatarAssetId),
    staleTime: 50 * 60 * 1000,
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
