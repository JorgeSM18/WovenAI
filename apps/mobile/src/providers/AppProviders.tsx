import { QueryClientProvider } from '@tanstack/react-query';
import { SupabaseProvider } from '@woven/data';
import { ThemeProvider, useTheme } from '@woven/ui';
import { colorScheme } from 'nativewind';
import { useEffect, type ReactNode } from 'react';

import { supabase } from '../auth/client';
import { AuthProvider } from './AuthProvider';
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
              <TelemetryProvider>{children}</TelemetryProvider>
            </ThemeProvider>
          </AuthProvider>
        </SupabaseProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
