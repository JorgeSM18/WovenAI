import type { Meta, StoryObj } from '@storybook/react-vite';
import { View } from 'react-native';

import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import { ThemeProvider, useTheme, type ThemeMode } from './ThemeProvider';

const NEXT: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

function ThemeDemo() {
  const { mode, scheme, setMode } = useTheme();
  return (
    <View className="gap-sm bg-background p-md">
      <Text variant="body-lg">
        Mode: {mode} — resolved: {scheme}
      </Text>
      <Button label={`Switch to ${NEXT[mode]}`} onPress={() => setMode(NEXT[mode])} />
    </View>
  );
}

const meta: Meta<typeof ThemeDemo> = {
  title: 'Theme/ThemeProvider',
  component: ThemeDemo,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ThemeDemo>;

export const Default: Story = {};
