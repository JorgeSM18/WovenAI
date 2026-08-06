import { z } from 'zod';

import type { WovenClient } from '../client';

export const IMAGE_MIMES = ['image/jpeg', 'image/webp', 'image/png'] as const;
export type ImageMime = (typeof IMAGE_MIMES)[number];

export type SignUploadInput = {
  type: 'original' | 'processed' | 'avatar' | 'outfit_cover';
  mime: ImageMime;
};

export const signUploadResultSchema = z.object({
  bucket: z.string(),
  path: z.string(),
  token: z.string(),
  signedUrl: z.string(),
});

export type SignUploadResult = z.infer<typeof signUploadResultSchema>;

/** Requests a signed upload URL from the `sign-upload` Edge Function. The
 *  response is validated with Zod (never trust the wire). */
export async function signUpload(
  client: WovenClient,
  input: SignUploadInput,
): Promise<SignUploadResult> {
  const { data, error } = await client.functions.invoke('sign-upload', { body: input });
  if (error) throw error;
  return signUploadResultSchema.parse(data);
}
