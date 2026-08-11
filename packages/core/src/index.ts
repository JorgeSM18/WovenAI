// Public entry for the Woven domain (packages/core). Pure, no framework/infra.
export { assertNever } from './assertNever';
export type {
  Profile,
  ProfileUpdate,
  ThemePreference,
  UnitsPreference,
  ViewDensity,
} from './profile';
export type { StylePreference } from './stylePreference';
export type { Category, Color, Season } from './reference';
export { validateTripDraft, enumerateDates } from './trip';
export type { Trip, TripStatus, TripDraft } from './trip';
export { aiServiceStub, backgroundRemovalServiceStub } from './ports';
export type {
  AiService,
  BackgroundRemovalService,
  ImageService,
  Classification,
  OutfitRecommendation,
  ProcessedImage,
} from './ports';
