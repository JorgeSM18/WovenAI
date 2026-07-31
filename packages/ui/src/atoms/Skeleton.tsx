import { View, type ViewProps } from 'react-native';

import { cn } from '../utils/cn';

export type SkeletonProps = ViewProps & {
  className?: string;
};

/**
 * Loading placeholder. Static for now; a shimmer animation is added later
 * (needs reanimated wiring). Hidden from assistive tech.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('rounded-lg bg-surface-container', className)}
      {...props}
    />
  );
}
