// Central query-key factory (one source of truth for cache keys/invalidation).
export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  garmentCount: (userId: string) => ['garment', userId, 'count'] as const,
  stylePreferences: (userId: string) => ['style-preference', userId] as const,
  categories: () => ['category'] as const,
  colors: () => ['color'] as const,
};
