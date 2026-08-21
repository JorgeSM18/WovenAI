import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';

/**
 * Reads a local image URI into an ArrayBuffer. RN's `fetch(uri).arrayBuffer()`
 * returns empty bytes for `file://` URIs (the silent upload failures), and the
 * new expo-file-system `File` API surfaced a native ExpoAsset error, so we use
 * the stable legacy `readAsStringAsync` (a plain native file read, base64) and
 * decode it here.
 */
export async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
