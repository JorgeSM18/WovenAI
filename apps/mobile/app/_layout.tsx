import '../global.css';

import {
  HankenGrotesk_300Light,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { colorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders } from '../src/providers/AppProviders';
import { getStoredTheme, type StoredThemeMode } from '../src/providers/themeStorage';

// Keep the splash visible until the Hanken Grotesk weights are registered;
// without them everything falls back to the system font (breaks the DS).
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    HankenGrotesk_300Light,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  // Resolve the saved theme while the splash is still up, so the very first
  // paint already uses the right scheme (no light→dark flash on cold start).
  const [initialTheme, setInitialTheme] = useState<StoredThemeMode | null>(null);
  useEffect(() => {
    void getStoredTheme().then((stored) => {
      const mode = stored ?? 'system';
      colorScheme.set(mode);
      setInitialTheme(mode);
    });
  }, []);

  const ready = (fontsLoaded || fontError) && initialTheme !== null;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders initialTheme={initialTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
