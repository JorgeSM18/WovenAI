import type { Meta, StoryObj } from '@storybook/react-vite';

import { Chip } from './Chip';

const meta = {
  title: 'Atoms/Chip',
  component: Chip,
  args: { label: 'Evening Wear' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
