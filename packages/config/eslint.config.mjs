import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Woven shared ESLint flat config.
 *
 * Enforces (ADR-013 / CLAUDE.md):
 *  - Dependency boundaries between layers (presentation -> application -> domain).
 *  - `packages/core` is pure (no framework/infra imports).
 *  - `packages/ui` never imports data/api/store (receives props).
 *  - `@supabase/supabase-js` only inside `packages/api`.
 *  - No deep relative imports (use `@woven/*` aliases).
 *  - No `any`, no `@ts-ignore`, consistent type imports.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/.turbo/**',
      '**/.expo/**',
      '**/generated/**',
      'docs/**',
      'design/**',
      'assets/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript source rules.
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../*'],
              message: 'Evita imports relativos profundos; usa alias @woven/*.',
            },
          ],
        },
      ],
    },
  },

  // Layer dependency boundaries (applies to workspace runtime source, not
  // to build/test tooling config which may reference @woven/config).
  {
    files: ['{apps,packages}/**/*.{ts,tsx,js,mjs}'],
    ignores: ['**/*.config.{ts,js,mjs,cjs}', '**/.storybook/**'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'core', pattern: 'packages/core/**' },
        { type: 'data', pattern: 'packages/data/**' },
        { type: 'api', pattern: 'packages/api/**' },
        { type: 'store', pattern: 'packages/store/**' },
        { type: 'ui', pattern: 'packages/ui/**' },
        { type: 'config', pattern: 'packages/config/**' },
        { type: 'analytics', pattern: 'packages/analytics/**' },
        { type: 'i18n', pattern: 'packages/i18n/**' },
        { type: 'app', pattern: 'apps/**' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'core', allow: [] },
            { from: 'config', allow: [] },
            { from: 'ui', allow: ['core', 'config'] },
            { from: 'api', allow: ['core', 'config'] },
            { from: 'store', allow: ['core', 'config'] },
            { from: 'data', allow: ['core', 'api', 'config'] },
            { from: 'analytics', allow: ['core', 'config'] },
            { from: 'i18n', allow: ['config'] },
            {
              from: 'app',
              allow: ['core', 'data', 'api', 'store', 'ui', 'config', 'analytics', 'i18n'],
            },
          ],
        },
      ],
      'boundaries/external': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: ['core'],
              disallow: [
                'react',
                'react-dom',
                'react-native',
                'expo',
                'expo-*',
                '@supabase/*',
                '@tanstack/*',
                'zustand',
              ],
              message: 'packages/core debe ser puro (sin framework/infra).',
            },
            {
              from: ['ui'],
              disallow: ['@supabase/*', '@tanstack/*', 'zustand'],
              message: 'packages/ui no accede a datos/estado; recibe props.',
            },
            {
              from: ['data', 'store', 'analytics', 'i18n', 'app'],
              disallow: ['@supabase/supabase-js'],
              message: 'Solo packages/api usa supabase-js directamente.',
            },
          ],
        },
      ],
    },
  },

  // Plain JS/config files are not type-checked.
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  // Node CommonJS config files (metro.config.js, babel.config.js, *.cjs...).
  {
    files: ['**/*.config.{js,cjs}', '**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Prettier owns formatting: disable conflicting stylistic rules (keep last).
  prettier,
);
