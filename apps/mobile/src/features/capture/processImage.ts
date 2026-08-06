import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_EDGE = 2048;

export type ProcessedImage = {
  uri: string;
  width: number;
  height: number;
  mime: 'image/jpeg';
};

/**
 * Prepares a captured photo for upload (§10.2): resize the long edge to ≤2048px,
 * recompress to JPEG ~0.8. Re-encoding produces a fresh file, which drops the
 * original EXIF (including geolocation) — the privacy requirement.
 */
export async function processForUpload(photo: {
  uri: string;
  width: number;
  height: number;
}): Promise<ProcessedImage> {
  const longestEdge = Math.max(photo.width, photo.height);
  const actions =
    longestEdge > MAX_EDGE
      ? [{ resize: photo.width >= photo.height ? { width: MAX_EDGE } : { height: MAX_EDGE } }]
      : [];
  const result = await manipulateAsync(photo.uri, actions, {
    compress: 0.8,
    format: SaveFormat.JPEG,
  });
  return { uri: result.uri, width: result.width, height: result.height, mime: 'image/jpeg' };
}
