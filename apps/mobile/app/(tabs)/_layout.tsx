import { Redirect, Tabs } from 'expo-router';

import { BottomNavBar, Icon, type BottomNavItem, type IconName } from '@woven/ui';

import { useAuth } from '../../src/providers/AuthProvider';

const navIcon = (inactive: IconName, active: IconName) => (isActive: boolean) => (
  <Icon
    name={isActive ? active : inactive}
    size={26}
    className={isActive ? 'text-primary' : 'text-on-surface-variant'}
  />
);

const items: BottomNavItem[] = [
  { key: 'home', label: 'Inicio', icon: navIcon('home-variant-outline', 'home-variant') },
  { key: 'inventory', label: 'Armario', icon: navIcon('wardrobe-outline', 'wardrobe') },
  { key: 'outfits', label: 'Looks', icon: navIcon('star-four-points-outline', 'star-four-points') },
  { key: 'trips', label: 'Viajes', icon: navIcon('bag-suitcase-outline', 'bag-suitcase') },
  { key: 'profile', label: 'Perfil', icon: navIcon('account-outline', 'account') },
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
