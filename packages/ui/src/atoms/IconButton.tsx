import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';

export type IconButtonProps = Omit<PressableProps, 'children' | 'accessibilityLabel'> & {
  icon: ReactNode;
  accessibilityLabel: string;
  className?: string;
};

/** Icon-only pressable with a 44px touch target and a required label. */
export function IconButton({
  icon,
  accessibilityLabel,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      className={cn(
        'h-touch-target-min w-touch-target-min items-center justify-center rounded-full active:opacity-70',
        disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {icon}
    </Pressable>
  );
}
