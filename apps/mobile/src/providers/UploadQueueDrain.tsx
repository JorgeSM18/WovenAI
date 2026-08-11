import NetInfo from '@react-native-community/netinfo';
import { setGarmentImage, uploadImage, useSupabaseClient } from '@woven/data';
import { usePendingUploads } from '@woven/store';
import { useEffect, useRef } from 'react';

import { useAuth } from './AuthProvider';

/**
 * Drains the offline upload queue (T-0405): when connectivity returns, uploads
 * each deferred image and links it to its garment. Renders nothing. Failures
 * keep the item queued for the next attempt.
 */
export function UploadQueueDrain() {
  const client = useSupabaseClient();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const draining = useRef(false);

  useEffect(() => {
    const drain = async () => {
      if (draining.current || !userId) return;
      if (usePendingUploads.getState().items.length === 0) return;
      draining.current = true;
      try {
        for (const item of usePendingUploads.getState().items) {
          try {
            const uploaded = await uploadImage(client, {
              userId,
              uri: item.uri,
              type: item.type,
              mime: item.mime,
              width: item.width,
              height: item.height,
            });
            await setGarmentImage(client, item.garmentId, uploaded.id);
            usePendingUploads.getState().remove(item.id);
          } catch {
            break; // still offline / failed — retry on the next reconnect
          }
        }
      } finally {
        draining.current = false;
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) void drain();
    });
    void drain();
    return () => unsubscribe();
  }, [client, userId]);

  return null;
}
