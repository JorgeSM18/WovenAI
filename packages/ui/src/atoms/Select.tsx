import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './Text';

export type SelectProps = Omit<PressableProps, 'children'> & {
  value: string;
  label?: string;
  placeholder?: string;
  className?: string;
};

/**
 * Presentational select field (value + chevron). Opening the option list is
 * handled by a higher-level component; this atom only renders the trigger.
 */
export function Select({ value, label, placeholder, className, ...props }: SelectProps) {
  return (
    <View className="gap-xs">
      {label ? (
        <Text variant="label-caps" className="text-on-surface-variant">
          {label}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder ?? 'Select'}
        className={cn(
          'min-h-touch-target-min flex-row items-center justify-between rounded-lg bg-surface-container px-md',
          className,
        )}
        {...props}
      >
        <Text variant="body-lg" className={value ? 'text-on-surface' : 'text-on-surface-variant'}>
          {value || placeholder}
        </Text>
        <Text variant="body-lg" className="text-on-surface-variant">
          ⌄
        </Text>
      </Pressable>
    </View>
  );
}
