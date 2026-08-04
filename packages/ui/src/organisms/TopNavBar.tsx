import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type TopNavItem = {
  key: string;
  label: string;
};

export type TopNavBarProps = {
  items: TopNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Leading slot; defaults to the Woven wordmark. */
  leading?: ReactNode;
  /** Trailing slot (e.g. avatar/actions). */
  trailing?: ReactNode;
  className?: string;
};

/** Desktop/tablet top navigation bar (wordmark + text links + trailing slot). */
export function TopNavBar({
  items,
  activeKey,
  onSelect,
  leading,
  trailing,
  className,
}: TopNavBarProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between border-b border-outline-variant bg-surface px-md py-sm',
        className,
      )}
    >
      <View className="flex-row items-center gap-lg">
        {leading ?? (
          <Text variant="headline-md" className="text-primary">
            Woven
          </Text>
        )}
        <View accessibilityRole="tablist" className="flex-row items-center gap-md">
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(item.key)}
                className="min-h-touch-target-min justify-center"
              >
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
      </View>
      {trailing}
    </View>
  );
}
