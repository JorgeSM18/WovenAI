import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '../atoms/Icon';
import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type SettingRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  onPress?: () => void;
  className?: string;
};

/** Settings list row: optional leading icon, title, subtitle, chevron. */
export function SettingRow({ title, subtitle, leading, onPress, className }: SettingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={onPress}
      className={cn('min-h-touch-target-min flex-row items-center gap-md px-md py-sm', className)}
    >
      {leading}
      <View className="flex-1 gap-xs">
        <Text variant="body-lg" className="text-on-surface">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body-md" className="text-on-surface-variant">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name="chevron-right" size={22} className="text-on-surface-variant" />
    </Pressable>
  );
}
