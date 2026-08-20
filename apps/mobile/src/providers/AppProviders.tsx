import { QueryClientProvider } from '@tanstack/react-query';
import { SupabaseProvider, useProfile } from '@woven/data';
import { ThemeProvider, useTheme } from '@woven/ui';
import { colorScheme } from 'nativewind';
import { useEffect, type ReactNode } from 'react';

import { supabase } from '../auth/client';
import { AuthProvider, useAuth } from './AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';
import { createQueryClient } from './queryClient';
import { TelemetryProvider } from './TelemetryProvider';
import { UploadQueueDrain } from './UploadQueueDrain';

const queryClient = createQueryClient();

/** Applies the chosen theme mode to NativeWind (safe to import here, Metro). */
function ThemeSync() {
  const { mode } = useTheme();
  useEffect(() => {
    colorScheme.set(mode);
  }, [mode]);
  return null;
}

/** Applies the user's persisted theme on cold start: once the profile loads,
 *  its stored preference drives the theme mode (which ThemeSync then applies).
 *  Settings still writes both, so this is a no-op after the user changes it. */
function ThemeFromProfile() {
  const { session } = useAuth();
  const profile = useProfile(session?.user.id ?? '');
  const { mode, setMode } = useTheme();
  const persisted = profile.data?.theme;
  useEffect(() => {
    if (persisted && persisted !== mode) setMode(persisted);
  }, [persisted, mode, setMode]);
  return null;
}

/** Root provider stack: ErrorBoundary → Query → Supabase → Auth → Theme → Telemetry. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider client={supabase}>
          <AuthProvider>
            <UploadQueueDrain />
            <ThemeProvider>
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
