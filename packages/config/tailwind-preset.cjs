// Woven design tokens as a Tailwind v3 preset, shared by NativeWind (mobile)
// and Tailwind (web). Source of truth: design/woven/DESIGN.md.
//
// CommonJS on purpose: Tailwind/NativeWind configs consume presets via
// require(), and this package is `type: module` (so a plain .js would be ESM).
//
// Only the light palette is encoded here. Dark-mode token values are not yet
// defined in the design system; they are wired with the theme provider (T-0106).

/** Material-3 token roles with Woven values (design/woven/DESIGN.md). */
const colors = {
  surface: '#fdf8f7',
  'surface-dim': '#ddd9d8',
  'surface-bright': '#fdf8f7',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f7f3f1',
  'surface-container': '#f1edec',
  'surface-container-high': '#ece7e6',
  'surface-container-highest': '#e6e1e0',
  'on-surface': '#1c1b1b',
  'on-surface-variant': '#4d4540',
  'inverse-surface': '#313030',
  'inverse-on-surface': '#f4f0ef',
  outline: '#7e7570',
  'outline-variant': '#d0c4be',
  'surface-tint': '#625d5b',
  primary: '#000000',
  'on-primary': '#ffffff',
  'primary-container': '#1e1b19',
  'on-primary-container': '#888380',
  'inverse-primary': '#ccc5c2',
  secondary: '#5e5e5c',
  'on-secondary': '#ffffff',
  'secondary-container': '#e1dfdc',
  'on-secondary-container': '#636361',
  tertiary: '#000000',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#1f1b17',
  'on-tertiary-container': '#8a827d',
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  'primary-fixed': '#e9e1dd',
  'primary-fixed-dim': '#ccc5c2',
  'on-primary-fixed': '#1e1b19',
  'on-primary-fixed-variant': '#4a4643',
  'secondary-fixed': '#e4e2df',
  'secondary-fixed-dim': '#c8c6c4',
  'on-secondary-fixed': '#1b1c1a',
  'on-secondary-fixed-variant': '#474745',
  'tertiary-fixed': '#eae1da',
  'tertiary-fixed-dim': '#cec5bf',
  'on-tertiary-fixed': '#1f1b17',
  'on-tertiary-fixed-variant': '#4b4641',
  background: '#fdf8f7',
  'on-background': '#1c1b1b',
  'surface-variant': '#e6e1e0',
};

module.exports = {
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['Hanken Grotesk', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg-mobile': [
          '32px',
          { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        'headline-md': [
          '24px',
          { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '500' },
        ],
        'title-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
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
        md: '24px',
        lg: '40px',
        xl: '64px',
        gutter: '16px',
        'margin-mobile': '20px',
        'margin-desktop': '80px',
        'touch-target-min': '44px',
      },
    },
  },
};
