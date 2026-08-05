import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { cn } from '../utils/cn';

export type TabScreenTemplateProps = {
  children: ReactNode;
  header?: ReactNode;
  fab?: ReactNode;
  className?: string;
  contentClassName?: string;
};

/** Scrollable tab screen with optional header and floating action button. */
export function TabScreenTemplate({
  children,
  header,
  fab,
  className,
  contentClassName,
}: TabScreenTemplateProps) {
  return (
    <View className={cn('flex-1 bg-background', className)}>
      {header}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={cn('gap-md p-md', contentClassName)}>{children}</View>
      </ScrollView>
      {fab ? <View className="absolute bottom-lg right-md">{fab}</View> : null}
    </View>
  );
}
