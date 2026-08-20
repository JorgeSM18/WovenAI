import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import type { WovenClient } from './client';

export type AuthService = ReturnType<typeof createAuthService>;

/**
 * Thin wrapper over Supabase Auth. It's the auth surface the app/hooks consume,
 * since only this package may import supabase-js (dependency boundary). Errors
 * are thrown (never swallowed) so callers can surface them.
 */
export function createAuthService(client: WovenClient) {
  const auth = client.auth;
  return {
    async signIn(email: string, password: string): Promise<Session> {
      const { data, error } = await auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.session;
    },

    /** Returns the session, or null when email confirmation is pending. */
    async signUp(email: string, password: string): Promise<Session | null> {
      const { data, error } = await auth.signUp({ email, password });
      if (error) throw error;
      return data.session;
    },

    async signOut(): Promise<void> {
      const { error } = await auth.signOut();
      if (error) throw error;
    },

    /** Updates the signed-in user's password. */
    async updatePassword(newPassword: string): Promise<void> {
      const { error } = await auth.updateUser({ password: newPassword });
      if (error) throw error;
    },

    /** Current persisted session, or null when signed out. */
    async getSession(): Promise<Session | null> {
      const { data, error } = await auth.getSession();
      if (error) throw error;
      return data.session;
    },

    /** Subscribes to auth changes; returns an unsubscribe function. */
    onChange(cb: (event: AuthChangeEvent, session: Session | null) => void): () => void {
      const { data } = auth.onAuthStateChange(cb);
      return () => data.subscription.unsubscribe();
    },
  };
}
