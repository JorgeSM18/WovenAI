import { Redirect, Tabs } from 'expo-router';

import { BottomNavBar, Text, type BottomNavItem } from '@woven/ui';

import { useAuth } from '../../src/providers/AuthProvider';

const glyph = (value: string) => (active: boolean) => (
  <Text variant="headline-md" className={active ? 'text-primary' : 'text-on-surface-variant'}>
    {value}
  </Text>
);

const items: BottomNavItem[] = [
  { key: 'home', label: 'Home', icon: glyph('⌂') },
  { key: 'inventory', label: 'Inventory', icon: glyph('▦') },
  { key: 'outfits', label: 'Outfits', icon: glyph('◈') },
  { key: 'trips', label: 'Trips', icon: glyph('✈') },
  { key: 'profile', label: 'Profile', icon: glyph('☻') },
];

export default function TabsLayout() {
  // Protect the shell against deep links; the entry gate lives in app/index.tsx.
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <BottomNavBar
          items={items}
          activeKey={state.routes[state.index]?.name ?? 'home'}
          onSelect={(key) => navigation.navigate(key)}
        />
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="outfits" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
