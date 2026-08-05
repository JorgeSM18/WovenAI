import type { Session } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { createAuthService } from './auth';
import type { WovenClient } from './client';

const session = { access_token: 'tok', user: { id: 'u1' } } as unknown as Session;
const authError = { name: 'AuthApiError', message: 'bad creds' };

/** Builds a WovenClient whose `.auth` is the given partial mock. */
function clientWith(auth: Record<string, unknown>): WovenClient {
  return { auth } as unknown as WovenClient;
}

describe('createAuthService', () => {
  it('signIn returns the session and forwards credentials', async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ data: { session }, error: null });
    const service = createAuthService(clientWith({ signInWithPassword }));

    await expect(service.signIn('a@b.dev', 'pw')).resolves.toBe(session);
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.dev', password: 'pw' });
  });

  it('signIn throws the auth error instead of swallowing it', async () => {
    const signInWithPassword = vi
      .fn()
      .mockResolvedValue({ data: { session: null }, error: authError });
    const service = createAuthService(clientWith({ signInWithPassword }));

    await expect(service.signIn('a@b.dev', 'wrong')).rejects.toBe(authError);
  });

  it('signUp returns null when confirmation is pending', async () => {
    const signUp = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const service = createAuthService(clientWith({ signUp }));

    await expect(service.signUp('a@b.dev', 'pw')).resolves.toBeNull();
  });

  it('signOut throws on error', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: authError });
    const service = createAuthService(clientWith({ signOut }));

    await expect(service.signOut()).rejects.toBe(authError);
  });

  it('getSession returns the current session', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session }, error: null });
    const service = createAuthService(clientWith({ getSession }));

    await expect(service.getSession()).resolves.toBe(session);
  });

  it('onChange returns an unsubscribe that tears down the subscription', () => {
    const unsubscribe = vi.fn();
    const onAuthStateChange = vi.fn().mockReturnValue({ data: { subscription: { unsubscribe } } });
    const service = createAuthService(clientWith({ onAuthStateChange }));

    const off = service.onChange(() => {});
    off();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
