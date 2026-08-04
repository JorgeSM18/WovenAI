// PD-01: the authentication UI is not designed yet. This stub treats the user
// as authenticated so the app shell is navigable during development. Replace
// with a real session (Supabase Auth) once PD-01 is resolved.
export type Session = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
};

export function useSession(): Session {
  return { isAuthenticated: true, hasCompletedOnboarding: true };
}
