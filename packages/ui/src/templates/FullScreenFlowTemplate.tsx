import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '../utils/cn';

export type FullScreenFlowTemplateProps = {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
};

/** Full-screen focused flow (capture/onboarding): no tab bar, edge to edge. */
export function FullScreenFlowTemplate({
  children,
  header,
  className,
}: FullScreenFlowTemplateProps) {
  return (
    <View className={cn('flex-1 bg-background', className)}>
      {header}
      <View className="flex-1">{children}</View>
    </View>
  );
}
