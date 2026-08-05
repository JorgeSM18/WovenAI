import { QueryClient } from '@tanstack/react-query';

/** App-wide TanStack Query client. Offline persistence is wired later (T-1001). */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 2 },
    },
  });
}
