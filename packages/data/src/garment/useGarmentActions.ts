import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useSupabaseClient } from '../supabaseContext';
import {
  deleteGarment,
  setGarmentFavorite,
  type GarmentDetail,
  type WardrobeItem,
} from './garmentRepository';

/** Toggles favorite with optimistic updates to the detail and list caches. */
export function useSetFavorite(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      setGarmentFavorite(client, id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      const detailKey = queryKeys.garment(id);
      const listKey = queryKeys.garments(userId);
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey }),
        queryClient.cancelQueries({ queryKey: listKey }),
      ]);
      const prevDetail = queryClient.getQueryData<GarmentDetail>(detailKey);
      const prevList = queryClient.getQueryData<WardrobeItem[]>(listKey);
      if (prevDetail) queryClient.setQueryData(detailKey, { ...prevDetail, isFavorite });
      if (prevList) {
        queryClient.setQueryData(
          listKey,
          prevList.map((item) => (item.id === id ? { ...item, isFavorite } : item)),
        );
      }
      return { prevDetail, prevList };
    },
    onError: (_error, { id }, context) => {
      if (context?.prevDetail) queryClient.setQueryData(queryKeys.garment(id), context.prevDetail);
      if (context?.prevList) queryClient.setQueryData(queryKeys.garments(userId), context.prevList);
    },
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.garment(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.garments(userId) });
    },
  });
}

/** Soft-deletes a garment and refreshes the wardrobe list + count. */
export function useDeleteGarment(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGarment(client, id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.garment(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.garments(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.garmentCount(userId) });
    },
  });
}
