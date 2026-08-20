import { Pressable, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './Text';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  className?: string;
};

/** Pill-shaped filter/selection chip. */
export function Chip({ label, selected = false, className, disabled, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      disabled={disabled}
      className={cn(
        'min-h-touch-target-min items-center justify-center rounded-full px-md active:opacity-70',
        selected ? 'bg-primary' : 'bg-surface-container',
        disabled && 'opacity-40',
        className,
      )}
      {...props}
    >
      <Text
        variant="label-caps"
        className={selected ? 'text-on-primary' : 'text-on-surface-variant'}
      >
        {label}
      </Text>
    </Pressable>
  );
}
