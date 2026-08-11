import { Redirect } from 'expo-router';

import { useAuth } from '../src/providers/AuthProvider';

/**
 * Auth gate (T-0302). Real session decides the entry route. PD-01: with no auth
 * UI yet, unauthenticated users land on the onboarding placeholder; once the
 * auth flow exists (T-0308) this points there. Onboarding-completion routing
 * waits for the profile (T-0303/T-0306).
 */
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null; // native splash covers the initial session lookup
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <Redirect href="/home" />;
}
