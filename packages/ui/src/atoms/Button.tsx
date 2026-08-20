import { Pressable, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './Text';

const CONTAINER = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-outline-variant',
  danger: 'bg-error',
} as const;

const LABEL = {
  primary: 'text-on-primary',
  secondary: 'text-on-surface',
  danger: 'text-on-error',
} as const;

export type ButtonVariant = keyof typeof CONTAINER;

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  className?: string;
};

/** Primary action button. Pill-shaped, meets the 44px touch target. */
export function Button({ label, variant = 'primary', className, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      className={cn(
        'min-h-touch-target-min items-center justify-center rounded-full px-md active:opacity-70',
        CONTAINER[variant],
        disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      <Text variant="title-sm" className={LABEL[variant]}>
        {label}
      </Text>
    </Pressable>
  );
}
