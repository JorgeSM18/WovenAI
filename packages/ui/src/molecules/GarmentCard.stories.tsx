import type { Meta, StoryObj } from '@storybook/react-vite';

import { GarmentCard } from './GarmentCard';

const meta = {
  title: 'Molecules/GarmentCard',
  component: GarmentCard,
  args: { name: 'Blue linen shirt' },
} satisfies Meta<typeof GarmentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {};
export const WithPhoto: Story = {
  args: { imageUri: 'https://picsum.photos/seed/woven/300/400' },
};
export const Favorite: Story = {
  args: { imageUri: 'https://picsum.photos/seed/woven/300/400', isFavorite: true },
};
