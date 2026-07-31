import { defineConfig } from 'vitest/config';

// Shared Vitest base config (T-0007). Packages re-export this (or extend it
// via `mergeConfig`). Unit tests live next to the code they cover, e.g.
// `src/foo.ts` + `src/foo.test.ts`.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
  },
});
