import { create } from 'zustand';

export type CanvasItem = {
  garmentId: string;
  thumbnailUrl: string | null;
  posX: number;
  posY: number;
  zIndex: number;
  scale: number;
  rotation: number;
};

const STEP = 24;

type StudioDraftState = {
  items: CanvasItem[];
  past: CanvasItem[][];
  future: CanvasItem[][];
  addItem: (garment: { garmentId: string; thumbnailUrl: string | null }) => void;
  moveItem: (garmentId: string, posX: number, posY: number) => void;
  scaleItem: (garmentId: string, scale: number) => void;
  rotateItem: (garmentId: string, rotation: number) => void;
  bringToFront: (garmentId: string) => void;
  removeItem: (garmentId: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
};

/** Applies a new items array, recording the previous one for undo. */
function withHistory(state: StudioDraftState, items: CanvasItem[]) {
  return { items, past: [...state.past, state.items], future: [] };
}

function patch(state: StudioDraftState, garmentId: string, change: Partial<CanvasItem>) {
  return state.items.map((item) => (item.garmentId === garmentId ? { ...item, ...change } : item));
}

/**
 * Studio draft (T-0605/T-0606). Module-level so the composition survives leaving
 * and returning to the Studio within a session; every edit is undoable/redoable.
 * Cross-restart persistence (AsyncStorage) is a follow-up.
 */
export const useStudioDraft = create<StudioDraftState>((set) => ({
  items: [],
  past: [],
  future: [],

  addItem: (garment) =>
    set((state) => {
      if (state.items.some((item) => item.garmentId === garment.garmentId)) return state;
      const next: CanvasItem = {
        garmentId: garment.garmentId,
        thumbnailUrl: garment.thumbnailUrl,
        posX: STEP * state.items.length,
        posY: STEP * state.items.length,
        zIndex: state.items.length,
        scale: 1,
        rotation: 0,
      };
      return withHistory(state, [...state.items, next]);
    }),

  moveItem: (garmentId, posX, posY) =>
    set((state) => withHistory(state, patch(state, garmentId, { posX, posY }))),

  scaleItem: (garmentId, scale) =>
    set((state) => withHistory(state, patch(state, garmentId, { scale }))),

  rotateItem: (garmentId, rotation) =>
    set((state) => withHistory(state, patch(state, garmentId, { rotation }))),

  bringToFront: (garmentId) =>
    set((state) => {
      const max = state.items.reduce((acc, item) => Math.max(acc, item.zIndex), -1);
      return withHistory(state, patch(state, garmentId, { zIndex: max + 1 }));
    }),

  removeItem: (garmentId) =>
    set((state) =>
      withHistory(
        state,
        state.items.filter((item) => item.garmentId !== garmentId),
      ),
    ),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        items: previous,
        past: state.past.slice(0, -1),
        future: [state.items, ...state.future],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        items: next,
        past: [...state.past, state.items],
        future: state.future.slice(1),
      };
    }),

  reset: () => set({ items: [], past: [], future: [] }),
}));
