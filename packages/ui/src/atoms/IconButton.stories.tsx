import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconButton } from './IconButton';
import { Text } from './Text';

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  args: {
    accessibilityLabel: 'Close',
    icon: <Text variant="headline-md">×</Text>,
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
