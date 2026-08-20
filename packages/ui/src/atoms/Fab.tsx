import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';

export type FabProps = Omit<PressableProps, 'children' | 'accessibilityLabel'> & {
  icon: ReactNode;
  accessibilityLabel: string;
  className?: string;
};

/** Floating action button (circular). */
export function Fab({ icon, accessibilityLabel, className, ...props }: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'h-14 w-14 items-center justify-center rounded-full bg-on-surface active:opacity-70',
        className,
      )}
      {...props}
    >
      {icon}
    </Pressable>
  );
}
