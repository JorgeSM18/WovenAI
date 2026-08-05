import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '../utils/cn';

export type TwoColumnTemplateProps = {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Sidebar + content layout for web/tablet. Stacks on narrow, side-by-side on md+. */
export function TwoColumnTemplate({ sidebar, children, className }: TwoColumnTemplateProps) {
  return (
    <View className={cn('flex-1 flex-col gap-lg bg-background p-md md:flex-row', className)}>
      <View className="md:w-1/3">{sidebar}</View>
      <View className="flex-1">{children}</View>
    </View>
  );
}
