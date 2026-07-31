import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Atoms/ProgressBar',
  component: ProgressBar,
  args: { value: 42 },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Full: Story = { args: { value: 100 } };
