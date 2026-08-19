import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type BottomNavItem = {
  key: string;
  label: string;
  /** Render function so the icon can reflect the active state (e.g. color/fill). */
  icon: (active: boolean) => ReactNode;
};

export type BottomNavBarProps = {
  items: BottomNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
};

/** Mobile bottom navigation bar (icon + label per destination). */
export function BottomNavBar({ items, activeKey, onSelect, className }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{ paddingBottom: insets.bottom + 8 }}
      className={cn(
        'flex-row items-center justify-around border-t border-outline-variant bg-surface px-sm pt-xs',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.key)}
            className="min-h-touch-target-min min-w-touch-target-min items-center justify-center gap-xs"
          >
            {item.icon(active)}
            <Text
              variant="label-caps"
              className={active ? 'text-primary' : 'text-on-surface-variant'}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
