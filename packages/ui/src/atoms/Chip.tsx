import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './Text';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  /** Optional element before the label (e.g. a color dot). */
  leading?: ReactNode;
  className?: string;
};

/** Pill-shaped filter/selection chip. */
export function Chip({
  label,
  selected = false,
  leading,
  className,
  disabled,
  ...props
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      className={cn(
        'min-h-touch-target-min flex-row items-center justify-center gap-xs rounded-full px-md active:opacity-70',
        selected ? 'bg-primary' : 'bg-surface-container',
        disabled && 'opacity-40',
        className,
      )}
      {...props}
    >
      {leading}
      <Text
        variant="label-caps"
        numberOfLines={1}
        className={selected ? 'text-on-primary' : 'text-on-surface-variant'}
      >
        {label}
      </Text>
    </Pressable>
  );
}
