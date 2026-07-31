import type { Meta, StoryObj } from '@storybook/react-vite';

import { Fab } from './Fab';
import { Text } from './Text';

const meta = {
  title: 'Atoms/Fab',
  component: Fab,
  args: {
    accessibilityLabel: 'Add item',
    icon: (
      <Text variant="headline-md" className="text-surface">
        ＋
      </Text>
    ),
  },
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
