import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Render React Native components on web via react-native-web + NativeWind.
  viteFinal: async (viteConfig) => {
    const { default: react } = await import('@vitejs/plugin-react');
    viteConfig.plugins = (viteConfig.plugins ?? []).filter(
      (plugin) =>
        !(
          plugin &&
          typeof plugin === 'object' &&
          'name' in plugin &&
          String((plugin as { name?: string }).name).includes('vite:react')
        ),
    );
    viteConfig.plugins.push(react({ jsxImportSource: 'nativewind' }));
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      'react-native': 'react-native-web',
    };
    // Prefer web variants of React Native libraries so their native-only
    // specs (codegen) are not pulled into the web bundle.
    viteConfig.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.cjs',
      '.json',
    ];
    viteConfig.resolve.mainFields = ['browser', 'module', 'main'];
    viteConfig.define = {
      ...viteConfig.define,
      'process.env.EXPO_OS': JSON.stringify('web'),
    };
    return viteConfig;
  },
};

export default config;
