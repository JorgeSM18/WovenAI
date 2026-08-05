import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './generated/database.types';

/**
 * Minimal storage the auth client persists the session into. Injected per
 * platform so this package stays free of Expo/DOM deps: mobile backs it with
 * expo-secure-store, web with localStorage.
 */
export type AuthStorage = {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
};

export type WovenClientConfig = {
  url: string;
  publishableKey: string;
  storage: AuthStorage;
};

export type WovenClient = SupabaseClient<Database>;

/** Creates the typed Supabase client. `publishableKey` is the public anon-tier
 *  key (safe in the client bundle); never pass the service_role/secret key. */
export function createWovenClient({
  url,
  publishableKey,
  storage,
}: WovenClientConfig): WovenClient {
  return createClient<Database>(url, publishableKey, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // native has no OAuth redirect URL to parse
    },
  });
}
