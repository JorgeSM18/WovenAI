import type { Meta, StoryObj } from '@storybook/react-vite';

import { ColorSwatch } from './ColorSwatch';

const meta = {
  title: 'Atoms/ColorSwatch',
  component: ColorSwatch,
  args: { color: '#f5f5dc', accessibilityLabel: 'Cream' },
} satisfies Meta<typeof ColorSwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
