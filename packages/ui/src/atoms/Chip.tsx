import { Pressable, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './Text';

export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  className?: string;
};

/** Pill-shaped filter/selection chip. */
export function Chip({ label, selected = false, className, ...props }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'min-h-touch-target-min items-center justify-center rounded-full px-md',
        selected ? 'bg-primary/10' : 'bg-surface-container',
        className,
      )}
      {...props}
    >
      <Text variant="label-caps" className={selected ? 'text-primary' : 'text-on-surface-variant'}>
        {label}
      </Text>
    </Pressable>
  );
}
