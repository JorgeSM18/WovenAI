import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from './Text';

const meta = {
  title: 'Atoms/Text',
  component: Text,
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = { args: { variant: 'body-md', children: 'The quick brown fox.' } };
export const Headline: Story = { args: { variant: 'headline-md', children: 'A headline' } };
export const Display: Story = { args: { variant: 'display-lg', children: 'Woven' } };
export const LabelCaps: Story = { args: { variant: 'label-caps', children: 'Inventory' } };
