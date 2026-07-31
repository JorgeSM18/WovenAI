import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select } from './Select';

const meta = {
  title: 'Atoms/Select',
  component: Select,
  args: { label: 'Category', value: 'Shirts & Blouses' },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Placeholder: Story = { args: { value: '', placeholder: 'Choose a category' } };
