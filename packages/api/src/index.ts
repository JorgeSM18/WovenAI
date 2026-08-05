// DB type contract (generated with `pnpm gen:types`; CI checks drift).
export type { Database, Json } from './generated/database.types';

// Supabase client + auth surface. Only this package imports supabase-js, so it
// re-exports the auth types the app needs (the app may not depend on it).
export { createWovenClient } from './client';
export type { WovenClient, WovenClientConfig, AuthStorage } from './client';
export { createAuthService } from './auth';
export type { AuthService } from './auth';
export type { Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
