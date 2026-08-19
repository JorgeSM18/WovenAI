import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '../utils/cn';

export type FullScreenFlowTemplateProps = {
  children: ReactNode;
  header?: ReactNode;
  className?: string;
};

/** Full-screen focused flow (capture/onboarding): no tab bar, edge to edge.
 *  Absorbs top + bottom safe-area insets so content clears notch and gesture bar. */
export function FullScreenFlowTemplate({
  children,
  header,
  className,
}: FullScreenFlowTemplateProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={cn('flex-1 bg-background', className)}
    >
      {header}
      <View className="flex-1">{children}</View>
    </View>
  );
}
