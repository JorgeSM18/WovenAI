// Domain model for the user profile. Literal unions (not enums) per house
// style; repositories map the generated DB row to/from this shape.

export type ThemePreference = 'light' | 'dark' | 'system';
export type UnitsPreference = 'metric' | 'imperial';
export type ViewDensity = 'editorial' | 'compact' | 'categories';

export type Profile = {
  id: string;
  displayName: string | null;
  email: string | null;
  avatarAssetId: string | null;
  hasCompletedOnboarding: boolean;
  viewDensity: ViewDensity;
  theme: ThemePreference;
  units: UnitsPreference;
  language: string;
  createdAt: string;
  updatedAt: string;
};

/** Fields a user may edit (id/email/timestamps are not user-writable). */
export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'displayName'
    | 'avatarAssetId'
    | 'hasCompletedOnboarding'
    | 'viewDensity'
    | 'theme'
    | 'units'
    | 'language'
  >
>;
