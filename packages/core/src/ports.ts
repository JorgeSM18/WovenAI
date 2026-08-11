// Ports (hexagonal) for the AI/image capabilities (T-0901). Interfaces only —
// the concrete providers are Pending Definition (PD-05), so the stubs below
// throw. Implementations live behind Edge Functions, never in the client.

import type { Season } from './reference';

export type ProcessedImage = {
  uri: string;
  width: number;
  height: number;
  mime: 'image/jpeg' | 'image/webp' | 'image/png';
};

/** Suggested garment attributes from classification (user confirms them). */
export type Classification = {
  categoryName: string | null;
  colorName: string | null;
  season: Season | null;
  style: string[];
  confidence: number;
};

export type OutfitRecommendation = {
  matchScore: number; // 0..100
  suggestions: string[];
  conflicts: string[];
};

/** Client-side image preparation (resize/compress/EXIF strip). */
export type ImageService = {
  processForUpload(input: { uri: string; width: number; height: number }): Promise<ProcessedImage>;
};

/** Background removal (Edge). Produces a new `processed` image_asset. */
export type BackgroundRemovalService = {
  removeBackground(imageAssetId: string): Promise<{ processedImageId: string }>;
};

/** Wardrobe AI (Edge): classification + outfit recommendation. */
export type AiService = {
  classifyGarment(imageAssetId: string): Promise<Classification>;
  recommendOutfit(garmentIds: string[]): Promise<OutfitRecommendation>;
};

const PD05 = 'AI provider is not defined yet (PD-05).';

/** Documented stubs — replaced by Edge-backed implementations once PD-05 lands. */
export const backgroundRemovalServiceStub: BackgroundRemovalService = {
  removeBackground() {
    return Promise.reject(new Error(PD05));
  },
};

export const aiServiceStub: AiService = {
  classifyGarment() {
    return Promise.reject(new Error(PD05));
  },
  recommendOutfit() {
    return Promise.reject(new Error(PD05));
  },
};
