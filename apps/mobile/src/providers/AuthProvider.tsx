import type { Session } from '@woven/api';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { authService } from '../auth/client';

type AuthState = {
  session: Session | null;
  isAuthenticated: boolean;
  /** True until the initial session lookup resolves (avoid gate flicker). */
  isLoading: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

/** Real session state backed by Supabase Auth (T-0302): the persisted session
 *  on mount plus live sign-in/out updates. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authService
      .getSession()
      .then((s) => {
        if (active) setSession(s);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const unsubscribe = authService.onChange((_event, s) => {
      setSession(s);
      setIsLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: session !== null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
