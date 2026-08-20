// DB type contract (generated with `pnpm gen:types`; CI checks drift).
export type { Database, Json } from './generated/database.types';

// Supabase client + auth surface. Only this package imports supabase-js, so it
// re-exports the auth types the app needs (the app may not depend on it).
export { createWovenClient } from './client';
export type { WovenClient, WovenClientConfig, AuthStorage } from './client';
export { createAuthService } from './auth';
export type { AuthService } from './auth';
export type { Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js';

// Edge function contracts.
export { signUpload, signUploadResultSchema, IMAGE_MIMES } from './edge/signUpload';
export type { SignUploadInput, SignUploadResult, ImageMime } from './edge/signUpload';
export { getWeather, weatherSnapshotSchema } from './edge/getWeather';
export type { WeatherSnapshot } from './edge/getWeather';
export { classifyGarment, classificationSchema } from './edge/classifyGarment';
export type { ClassificationResult } from './edge/classifyGarment';
export { embedGarment } from './edge/embedGarment';
export { searchGarments, garmentMatchSchema } from './edge/searchGarments';
export type { GarmentMatch } from './edge/searchGarments';
