import { create } from 'zustand';

// --- Import review queue (T-0409) --------------------------------------------
// Images picked from the gallery and uploaded, waiting to be reviewed one by one.

export type ImportItem = { imageId: string; uri: string };

type ImportQueueState = {
  items: ImportItem[];
  enqueue: (items: ImportItem[]) => void;
  dequeue: () => void;
  clear: () => void;
};

export const useImportQueue = create<ImportQueueState>((set) => ({
  items: [],
  enqueue: (items) => set((state) => ({ items: [...state.items, ...items] })),
  dequeue: () => set((state) => ({ items: state.items.slice(1) })),
  clear: () => set({ items: [] }),
}));

// --- Offline upload queue (T-0405) -------------------------------------------
// Processed images whose upload was deferred (offline); drained on reconnect and
// linked to their garment. Session-scoped for now (AsyncStorage persistence is a
// follow-up).

export type PendingUpload = {
  id: string;
  garmentId: string;
  uri: string;
  type: 'original' | 'processed' | 'avatar' | 'outfit_cover';
  mime: 'image/jpeg' | 'image/webp' | 'image/png';
  width: number;
  height: number;
};

type PendingUploadsState = {
  items: PendingUpload[];
  enqueue: (item: PendingUpload) => void;
  remove: (id: string) => void;
};

export const usePendingUploads = create<PendingUploadsState>((set) => ({
  items: [],
  enqueue: (item) => set((state) => ({ items: [...state.items, item] })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

// --- Background-removal queue (T-0902) ---------------------------------------
// Garments whose original image still needs its background removed (self-hosted
// rembg), so every garment ends up as a clean cutout. Drained when online;
// failures stay queued for the next attempt. Session-scoped for now.

export type ProcessItem = { id: string; garmentId: string; imageId: string };

type ProcessQueueState = {
  items: ProcessItem[];
  enqueue: (item: ProcessItem) => void;
  remove: (id: string) => void;
};

export const useProcessQueue = create<ProcessQueueState>((set) => ({
  items: [],
  enqueue: (item) => set((state) => ({ items: [...state.items, item] })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));
