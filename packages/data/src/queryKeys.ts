// Central query-key factory (one source of truth for cache keys/invalidation).
export const queryKeys = {
  profile: (userId: string) => ['profile', userId] as const,
  garmentCount: (userId: string) => ['garment', userId, 'count'] as const,
  garments: (userId: string) => ['garment', userId, 'list'] as const,
  garment: (id: string) => ['garment', 'detail', id] as const,
  outfits: (userId: string) => ['outfit', userId, 'list'] as const,
  outfit: (id: string) => ['outfit', 'detail', id] as const,
  stylePreferences: (userId: string) => ['style-preference', userId] as const,
  categories: () => ['category'] as const,
  colors: () => ['color'] as const,
  trips: (userId: string) => ['trip', userId, 'list'] as const,
  trip: (id: string) => ['trip', 'detail', id] as const,
  tripGarments: (tripId: string) => ['trip', tripId, 'garments'] as const,
  tripDays: (tripId: string) => ['trip', tripId, 'days'] as const,
};
