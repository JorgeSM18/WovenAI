import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatCard } from './StatCard';

const meta = {
  title: 'Molecules/StatCard',
  component: StatCard,
  args: { label: 'Total Items', value: '142' },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Currency: Story = { args: { label: 'Cost Per Wear', value: '$12.40' } };
