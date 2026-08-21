import { File } from 'expo-file-system';

/**
 * Reads a local image URI into an ArrayBuffer. Uses expo-file-system's File
 * (native) because RN's `fetch(fileUri).arrayBuffer()` is unreliable and often
 * returns empty bytes — the cause of the silent upload failures.
 */
export async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  return new File(uri).arrayBuffer();
}
