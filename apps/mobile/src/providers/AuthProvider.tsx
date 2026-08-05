import { createContext, useContext, type ReactNode } from 'react';

import { useSession, type Session } from '../auth/session';

const AuthContext = createContext<Session | null>(null);

/** Provides the current session. PD-01: backed by a stub until auth is designed. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

export function useAuth(): Session {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
