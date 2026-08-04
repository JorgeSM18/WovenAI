import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '../atoms/Text';
import { BottomNavBar } from './BottomNavBar';

const glyph = (value: string) => (active: boolean) => (
  <Text variant="headline-md" className={active ? 'text-primary' : 'text-on-surface-variant'}>
    {value}
  </Text>
);

const items = [
  { key: 'home', label: 'Home', icon: glyph('⌂') },
  { key: 'inventory', label: 'Inventory', icon: glyph('▦') },
  { key: 'outfits', label: 'Outfits', icon: glyph('◈') },
  { key: 'trips', label: 'Trips', icon: glyph('✈') },
  { key: 'profile', label: 'Profile', icon: glyph('☻') },
];

const meta = {
  title: 'Organisms/BottomNavBar',
  component: BottomNavBar,
  args: { items, activeKey: 'home', onSelect: () => {} },
} satisfies Meta<typeof BottomNavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {};
export const InventoryActive: Story = { args: { activeKey: 'inventory' } };
