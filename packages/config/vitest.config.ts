import { defineConfig } from 'vitest/config';

// Config's own tests live at the package root (next to the files they lock),
// not under src/ — this package ships tooling, not a src tree.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['*.test.ts'],
  },
});
