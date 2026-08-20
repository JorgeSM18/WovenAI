import { removeBackground } from '@woven/api';
import { useQueryClient } from '@tanstack/react-query';
import { linkProcessedImage, useSupabaseClient } from '@woven/data';
import { useProcessQueue } from '@woven/store';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';

import { useAuth } from './AuthProvider';

/**
 * Drains the background-removal queue (T-0902): every garment eventually becomes
 * a clean cutout. When online, sends each garment's original image to the
 * self-hosted rembg service and links the processed result. Renders nothing.
 * Failures (rembg down / offline) keep the item queued for the next attempt.
 */
export function BackgroundRemovalDrain() {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const draining = useRef(false);

  useEffect(() => {
    const drain = async () => {
      if (draining.current || !userId) return;
      if (useProcessQueue.getState().items.length === 0) return;
      draining.current = true;
      let processedAny = false;
      try {
        for (const item of useProcessQueue.getState().items) {
          try {
            const processedId = await removeBackground(client, item.imageId);
            await linkProcessedImage(client, item.garmentId, processedId);
            useProcessQueue.getState().remove(item.id);
            processedAny = true;
          } catch {
            break; // rembg down / offline — retry on the next reconnect
          }
        }
      } finally {
        draining.current = false;
        // Refresh thumbnails (they prefer processed_image_id once it exists).
        if (processedAny) void queryClient.invalidateQueries();
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) void drain();
    });
    void drain();
    return () => unsubscribe();
  }, [client, userId, queryClient]);

  return null;
}
