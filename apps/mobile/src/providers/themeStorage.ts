import * as SecureStore from 'expo-secure-store';

export type StoredThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'woven_theme_pref';

/** Last chosen theme, read at startup so the first paint uses the right scheme. */
export async function getStoredTheme(): Promise<StoredThemeMode | null> {
  try {
    const value = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    // Ignore storage errors on startup.
  }
  return null;
}

export async function setStoredTheme(mode: StoredThemeMode): Promise<void> {
  try {
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors.
  }
}
