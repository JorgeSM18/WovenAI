import { QueryClientProvider } from '@tanstack/react-query';
import { SupabaseProvider, useProfile } from '@woven/data';
import { ThemeProvider, useTheme } from '@woven/ui';
import { colorScheme } from 'nativewind';
import { useEffect, useRef, type ReactNode } from 'react';

import { supabase } from '../auth/client';
import { AuthProvider, useAuth } from './AuthProvider';
import { BackgroundRemovalDrain } from './BackgroundRemovalDrain';
import { ErrorBoundary } from './ErrorBoundary';
import { createQueryClient } from './queryClient';
import { setStoredTheme, type StoredThemeMode } from './themeStorage';
import { TelemetryProvider } from './TelemetryProvider';
import { UploadQueueDrain } from './UploadQueueDrain';

const queryClient = createQueryClient();

/** Applies the chosen theme to NativeWind and persists it for the next launch. */
function ThemeSync() {
  const { mode } = useTheme();
  useEffect(() => {
    colorScheme.set(mode);
    void setStoredTheme(mode);
  }, [mode]);
  return null;
}

/** Applies the user's remote profile theme once after it loads (e.g. first login
 *  on a new device), without bouncing later local changes. */
function ThemeFromProfile() {
  const { session } = useAuth();
  const profile = useProfile(session?.user.id ?? '');
  const { setMode } = useTheme();
  const persisted = profile.data?.theme;
  const syncedRef = useRef(false);

  useEffect(() => {
    if (persisted && !syncedRef.current) {
      syncedRef.current = true;
      setMode(persisted);
    }
  }, [persisted, setMode]);

  return null;
}

/** Root provider stack: ErrorBoundary → Query → Supabase → Auth → Theme → Telemetry.
 *  `initialTheme` is resolved in the root layout before the first paint. */
export function AppProviders({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: StoredThemeMode;
}) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider client={supabase}>
          <AuthProvider>
            <UploadQueueDrain />
            <BackgroundRemovalDrain />
            <ThemeProvider initialMode={initialTheme}>
              <ThemeSync />
              <ThemeFromProfile />
              <TelemetryProvider>{children}</TelemetryProvider>
            </ThemeProvider>
          </AuthProvider>
        </SupabaseProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
