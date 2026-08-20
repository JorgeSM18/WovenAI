// Woven design tokens as a Tailwind v3 preset, shared by NativeWind (mobile)
// and Tailwind (web). Source of truth: Product Experience 2.0 design system
// (design export: product_experience_2.0/DESIGN.md + DS board image).
//
// CommonJS on purpose: Tailwind/NativeWind configs consume presets via
// require(), and this package is `type: module` (so a plain .js would be ESM).
//
// Font weights are encoded as separate families (hk-*) because React Native /
// Android selects fonts by exact family name, not numeric fontWeight. The Text
// atom maps each type role to the correct weight family.

// Material-3 token roles. Values resolve to CSS variables (R G B triplets)
// declared per-theme in apps/mobile/global.css, so light/dark swaps happen at
// the token level. `<alpha-value>` keeps opacity utilities (e.g. bg-primary/10)
// working. Charcoal primary #1C1917, muted sage tertiary #848D78 (DS board).
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

const COLOR_TOKENS = [
  'surface',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'on-surface',
  'on-surface-variant',
  'inverse-surface',
  'inverse-on-surface',
  'outline',
  'outline-variant',
  'surface-tint',
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'inverse-primary',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',
  'background',
  'on-background',
  'surface-variant',
];

const colors = Object.fromEntries(COLOR_TOKENS.map((name) => [name, token(name)]));

module.exports = {
  theme: {
    extend: {
      colors,
      fontFamily: {
        // `sans` (regular) is the default applied by the Text atom and inputs.
        sans: ['HankenGrotesk_400Regular', 'sans-serif'],
        'hk-light': ['HankenGrotesk_300Light', 'sans-serif'],
        'hk-medium': ['HankenGrotesk_500Medium', 'sans-serif'],
        'hk-semibold': ['HankenGrotesk_600SemiBold', 'sans-serif'],
        'hk-bold': ['HankenGrotesk_700Bold', 'sans-serif'],
      },
      // Weight lives in the family (hk-*), not here — see Text atom mapping.
      fontSize: {
        'display-lg': ['80px', { lineHeight: '92px', letterSpacing: '-0.04em' }],
        'display-md': ['56px', { lineHeight: '64px', letterSpacing: '-0.03em' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
        'headline-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em' }],
        'title-sm': ['18px', { lineHeight: '24px' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.15em' }],
        'label-sm': ['13px', { lineHeight: '18px', letterSpacing: '0.01em' }],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        base: '4px',
        xs: '8px',
        sm: '16px',
        md: '32px',
        lg: '64px',
        xl: '128px',
        gutter: '24px',
        'margin-mobile': '20px',
        'margin-desktop': '80px',
        'touch-target-min': '44px',
      },
    },
  },
};
