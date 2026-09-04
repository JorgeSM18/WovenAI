import { decode } from 'base64-arraybuffer';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';

/**
 * Reads a local image URI into an ArrayBuffer. RN's `fetch(uri).arrayBuffer()`
 * returns empty bytes for `file://` URIs (the silent upload failures), and the
 * new expo-file-system `File` API surfaced a native ExpoAsset error — so we read
 * the file as base64 via the stable legacy API and decode it with
 * base64-arraybuffer (correct across runtimes, no reliance on a global `atob`).
 */
export async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
  return decode(base64);
}
