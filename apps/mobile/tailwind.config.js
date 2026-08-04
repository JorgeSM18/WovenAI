// Tailwind config for the mobile app (NativeWind). Scans app + shared UI so
// the design-system class names are included.
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset'), require('@woven/config/tailwind-preset')],
  darkMode: 'class',
};
