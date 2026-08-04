import { Redirect } from 'expo-router';

import { useSession } from '../src/auth/session';

/**
 * Auth gate (stub). PD-01: with no auth UI yet, unauthenticated users are sent
 * to onboarding; once designed they would go to a dedicated auth flow.
 */
export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding } = useSession();
  if (!isAuthenticated || !hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/home" />;
}
