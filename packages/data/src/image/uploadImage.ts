import { signUpload, type SignUploadInput, type WovenClient } from '@woven/api';

import { createImageAsset } from './imageAssetRepository';

export type UploadImageInput = {
  userId: string;
  /** Raw image bytes (read platform-side; keeps this layer Expo-free). */
  bytes: ArrayBuffer;
  type: SignUploadInput['type'];
  mime: SignUploadInput['mime'];
  width: number;
  height: number;
};

export type UploadedImage = { id: string; storagePath: string };

const BUCKET = 'images';
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/png': 'png',
};

/**
 * Uploads image bytes and records them: sign a URL (Edge) → push to Storage →
 * insert the image_asset row. If the Edge Function is unavailable, falls back to
 * a direct authenticated upload (governed by the images insert RLS policy).
 * Returns the new asset id + storage path.
 */
export async function uploadImage(
  client: WovenClient,
  input: UploadImageInput,
): Promise<UploadedImage> {
  const { bytes } = input;
  let bucket = BUCKET;
  let path = `${input.userId}/${input.type}/${crypto.randomUUID()}.${EXT_MAP[input.mime] ?? 'jpg'}`;

  try {
    const signed = await signUpload(client, { type: input.type, mime: input.mime });
    bucket = signed.bucket;
    path = signed.path;
    const { error } = await client.storage
      .from(bucket)
      .uploadToSignedUrl(path, signed.token, bytes, { contentType: input.mime });
    if (error) throw error;
  } catch {
    const { error } = await client.storage
      .from(bucket)
      .upload(path, bytes, { contentType: input.mime, upsert: true });
    if (error) throw error;
  }

  const storagePath = `${bucket}/${path}`;
  const id = await createImageAsset(client, {
    userId: input.userId,
    storagePath,
    type: input.type,
    width: input.width,
    height: input.height,
    mime: input.mime,
    bytes: bytes.byteLength,
  });

  return { id, storagePath };
}
