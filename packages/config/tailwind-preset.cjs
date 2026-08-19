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

/** Material-3 token roles with Product Experience 2.0 values. */
const colors = {
  surface: '#fbf9f6',
  'surface-dim': '#dbdad7',
  'surface-bright': '#fbf9f6',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f5f3f0',
  'surface-container': '#efeeeb',
  'surface-container-high': '#eae8e5',
  'surface-container-highest': '#e4e2df',
  'on-surface': '#1b1c1a',
  'on-surface-variant': '#4d4540',
  'inverse-surface': '#30312f',
  'inverse-on-surface': '#f2f0ed',
  outline: '#7e7570',
  'outline-variant': '#d0c4be',
  'surface-tint': '#625d5b',
  // Charcoal primary (DS board image: #1C1917).
  primary: '#1c1917',
  'on-primary': '#ffffff',
  'primary-container': '#1e1b19',
  'on-primary-container': '#888380',
  'inverse-primary': '#ccc5c2',
  secondary: '#5e5e5d',
  'on-secondary': '#ffffff',
  'secondary-container': '#e0dfde',
  'on-secondary-container': '#626361',
  // Muted sage tertiary (DS board image: #848D78) for accents / success.
  tertiary: '#848d78',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#dde6ce',
  'on-tertiary-container': '#161e0f',
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  'primary-fixed': '#e9e1dd',
  'primary-fixed-dim': '#ccc5c2',
  'on-primary-fixed': '#1e1b19',
  'on-primary-fixed-variant': '#4a4643',
  'secondary-fixed': '#e3e2e0',
  'secondary-fixed-dim': '#c7c6c5',
  'on-secondary-fixed': '#1a1c1b',
  'on-secondary-fixed-variant': '#464746',
  'tertiary-fixed': '#dde6ce',
  'tertiary-fixed-dim': '#c1cab3',
  'on-tertiary-fixed': '#161e0f',
  'on-tertiary-fixed-variant': '#414938',
  background: '#fbf9f6',
  'on-background': '#1b1c1a',
  'surface-variant': '#e4e2df',
};

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
