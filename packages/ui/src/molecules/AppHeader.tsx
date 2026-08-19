import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type AppHeaderProps = {
  /** Brand wordmark or screen title. Defaults to the Woven wordmark. */
  title?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

/** Top app bar: wordmark/title with optional leading and trailing slots.
 *  Absorbs the top safe-area inset so content clears the notch. */
export function AppHeader({ title = 'Woven', leading, trailing, className }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className={cn('flex-row items-center justify-between bg-surface px-md pb-sm', className)}
    >
      <View className="flex-row items-center gap-sm">
        {leading}
        <Text variant="title-sm" className="text-on-surface">
          {title}
        </Text>
      </View>
      {trailing}
    </View>
  );
}
