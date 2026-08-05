import { createAuthService, createWovenClient } from '@woven/api';

import { secureStorage } from './secureStorage';

// Public config, injected at build time via EXPO_PUBLIC_* env (see .env.example).
// Only the publishable (anon) key belongs here — never the service_role key.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.',
  );
}

export const supabase = createWovenClient({ url, publishableKey, storage: secureStorage });

/** App-wide auth surface. The routing gate / AuthContext (T-0302) consumes this. */
export const authService = createAuthService(supabase);
