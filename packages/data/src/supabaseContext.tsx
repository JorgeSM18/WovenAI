import type { WovenClient } from '@woven/api';
import { createContext, useContext, type ReactNode } from 'react';

// The app owns the concrete client (it wires platform storage/env); this package
// only defines the context so hooks can reach it without threading it through props.
const SupabaseContext = createContext<WovenClient | null>(null);

export function SupabaseProvider({
  client,
  children,
}: {
  client: WovenClient;
  children: ReactNode;
}) {
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

export function useSupabaseClient(): WovenClient {
  const client = useContext(SupabaseContext);
  if (!client) {
    throw new Error('useSupabaseClient must be used within a SupabaseProvider');
  }
  return client;
}
