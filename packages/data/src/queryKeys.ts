// Central query-key factory (one source of truth for cache keys/invalidation).
export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
};
