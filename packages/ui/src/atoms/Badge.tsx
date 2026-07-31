import { View } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './Text';

const CONTAINER = {
  default: 'bg-surface-container',
  primary: 'bg-primary',
} as const;

const LABEL = {
  default: 'text-on-surface-variant',
  primary: 'text-on-primary',
} as const;

export type BadgeVariant = keyof typeof CONTAINER;

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

/** Small status/label pill (e.g. "AI DETECTED"). */
export function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <View className={cn('self-start rounded-full px-sm py-xs', CONTAINER[variant], className)}>
      <Text variant="label-caps" className={LABEL[variant]}>
        {label}
      </Text>
    </View>
  );
}
