// Tailwind config for the Woven design system (NativeWind + web).
// Combines the NativeWind preset with the shared Woven token preset.
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset'), require('@woven/config/tailwind-preset')],
  darkMode: 'class',
};
