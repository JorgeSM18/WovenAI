import type { AuthStorage } from '@woven/api';
import * as SecureStore from 'expo-secure-store';

// Session persistence backed by the device keychain/keystore.
// ponytail: expo-secure-store caps a value at ~2048 bytes. A typical Supabase
// session fits, but large custom JWT claims could exceed it. Upgrade path if
// that happens: chunk the value across keys, or encrypt it with a keychain-held
// key and store the ciphertext in AsyncStorage (LargeSecureStore pattern).
export const secureStorage: AuthStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};
