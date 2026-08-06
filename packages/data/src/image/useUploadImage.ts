import { useMutation } from '@tanstack/react-query';

import { useSupabaseClient } from '../supabaseContext';
import { uploadImage, type UploadImageInput } from './uploadImage';

/** Uploads a processed image and records its image_asset. */
export function useUploadImage() {
  const client = useSupabaseClient();
  return useMutation({
    mutationFn: (input: UploadImageInput) => uploadImage(client, input),
  });
}
