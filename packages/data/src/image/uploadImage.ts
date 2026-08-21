import { signUpload, type SignUploadInput, type WovenClient } from '@woven/api';

import { createImageAsset } from './imageAssetRepository';

export type UploadImageInput = {
  userId: string;
  uri: string;
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
 * Uploads a local image and records it: sign a URL (Edge) → push the binary to
 * Storage → insert the image_asset row. If the Edge Function is unavailable,
 * falls back to direct authenticated upload (governed by images_insert_own RLS).
 * Returns the new asset id + storage path.
 */
export async function uploadImage(
  client: WovenClient,
  input: UploadImageInput,
): Promise<UploadedImage> {
  const binary = await fetch(input.uri).then((response) => response.arrayBuffer());

  let bucket = BUCKET;
  let path = `${input.userId}/${input.type}/${crypto.randomUUID()}.${EXT_MAP[input.mime] ?? 'jpg'}`;

  try {
    const signed = await signUpload(client, { type: input.type, mime: input.mime });
    bucket = signed.bucket;
    path = signed.path;
    const { error: signedError } = await client.storage
      .from(bucket)
      .uploadToSignedUrl(path, signed.token, binary, { contentType: input.mime });
    if (signedError) throw signedError;
  } catch {
    // Fallback: direct authenticated upload to user's storage folder
    const { error: directError } = await client.storage
      .from(bucket)
      .upload(path, binary, { contentType: input.mime, upsert: true });
    if (directError) throw directError;
  }

  const storagePath = `${bucket}/${path}`;
  const id = await createImageAsset(client, {
    userId: input.userId,
    storagePath,
    type: input.type,
    width: input.width,
    height: input.height,
    mime: input.mime,
    bytes: binary.byteLength,
  });

  return { id, storagePath };
}
