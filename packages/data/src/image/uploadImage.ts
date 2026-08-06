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

/**
 * Uploads a local image and records it: sign a URL (Edge) → push the binary to
 * Storage → insert the image_asset row. Returns the new asset id + storage path.
 */
export async function uploadImage(
  client: WovenClient,
  input: UploadImageInput,
): Promise<UploadedImage> {
  const { bucket, path, token } = await signUpload(client, { type: input.type, mime: input.mime });

  const binary = await fetch(input.uri).then((response) => response.arrayBuffer());
  const { error } = await client.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, binary, { contentType: input.mime });
  if (error) throw error;

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
