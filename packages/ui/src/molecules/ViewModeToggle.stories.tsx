import type { Meta, StoryObj } from '@storybook/react-vite';

import { ViewModeToggle } from './ViewModeToggle';

const options = [
  { value: 'editorial', label: 'Editorial' },
  { value: 'compact', label: 'Compact' },
  { value: 'categories', label: 'Categories' },
];

const meta = {
  title: 'Molecules/ViewModeToggle',
  component: ViewModeToggle,
  args: { options, value: 'editorial', onChange: () => {} },
} satisfies Meta<typeof ViewModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Compact: Story = { args: { value: 'compact' } };
