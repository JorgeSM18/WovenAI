import type { Meta, StoryObj } from '@storybook/react-vite';

import { CollectionChipRow } from './CollectionChipRow';

const meta = {
  title: 'Molecules/CollectionChipRow',
  component: CollectionChipRow,
  args: {
    items: ['All Items', 'Essentials', 'Evening Wear', 'Work Uniform', 'Travel Essentials'],
    selected: 'All Items',
    onSelect: () => {},
  },
} satisfies Meta<typeof CollectionChipRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
