import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '../atoms/Avatar';
import { TopNavBar } from './TopNavBar';

const items = [
  { key: 'home', label: 'Home' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'outfits', label: 'Outfits' },
  { key: 'trips', label: 'Trips' },
  { key: 'profile', label: 'Profile' },
];

const meta = {
  title: 'Organisms/TopNavBar',
  component: TopNavBar,
  args: {
    items,
    activeKey: 'home',
    onSelect: () => {},
    trailing: <Avatar uri="https://i.pravatar.cc/80" accessibilityLabel="Julian Thorne" />,
  },
} satisfies Meta<typeof TopNavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {};
export const OutfitsActive: Story = { args: { activeKey: 'outfits' } };
