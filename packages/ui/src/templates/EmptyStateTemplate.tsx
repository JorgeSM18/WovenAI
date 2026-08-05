import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type EmptyStateTemplateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Centered empty state: icon, title, description and an optional action. */
export function EmptyStateTemplate({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateTemplateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center gap-md bg-background p-lg', className)}>
      {icon}
      <Text variant="headline-md" className="text-center text-on-surface">
        {title}
      </Text>
      {description ? (
        <Text variant="body-md" className="text-center text-on-surface-variant">
          {description}
        </Text>
      ) : null}
      {action}
    </View>
  );
}
