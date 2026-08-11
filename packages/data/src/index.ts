export { SupabaseProvider, useSupabaseClient } from './supabaseContext';
export { queryKeys } from './queryKeys';
export {
  getProfile,
  updateProfile,
  rowToProfile,
  profileUpdateToRow,
} from './profile/profileRepository';
export { useProfile, useUpdateProfile } from './profile/useProfile';
export {
  countGarments,
  createGarment,
  listGarments,
  listForgottenGarments,
  getGarment,
  setGarmentFavorite,
  deleteGarment,
  markGarmentWorn,
  setGarmentImage,
} from './garment/garmentRepository';
export type { CreateGarmentInput, WardrobeItem, GarmentDetail } from './garment/garmentRepository';
export { useGarmentCount } from './garment/useGarmentCount';
export { useCreateGarment } from './garment/useCreateGarment';
export { useGarments, useGarment, useForgottenGarments } from './garment/useGarments';
export { useSetFavorite, useDeleteGarment, useMarkGarmentWorn } from './garment/useGarmentActions';
export { saveOutfit, listOutfits, getOutfit } from './outfit/outfitRepository';
export type {
  CreateOutfitInput,
  OutfitItemInput,
  OutfitSummary,
  OutfitDetail,
  OutfitItemView,
} from './outfit/outfitRepository';
export { useSaveOutfit, useOutfits, useOutfit } from './outfit/useSaveOutfit';
export {
  listTrips,
  createTrip,
  getTrip,
  listTripGarments,
  addTripGarment,
  removeTripGarment,
  getTripDays,
  assignOutfitToDay,
} from './trip/tripRepository';
export type { TripGarment, TripDayAssignment } from './trip/tripRepository';
export {
  useTrips,
  useCreateTrip,
  useTrip,
  useTripGarments,
  useToggleTripGarment,
  useTripDays,
  useAssignOutfitToDay,
} from './trip/useTrips';
export { listCategories, listColors } from './reference/referenceRepository';
export { useCategories, useColors } from './reference/useReference';
export {
  listStylePreferences,
  addStylePreference,
  removeStylePreference,
  rowToStylePreference,
} from './stylePreference/stylePreferenceRepository';
export {
  useStylePreferences,
  useAddStylePreference,
  useRemoveStylePreference,
} from './stylePreference/useStylePreferences';
export { createImageAsset } from './image/imageAssetRepository';
export type { ImageType, NewImageAsset } from './image/imageAssetRepository';
export { uploadImage } from './image/uploadImage';
export type { UploadImageInput, UploadedImage } from './image/uploadImage';
export { useUploadImage } from './image/useUploadImage';
