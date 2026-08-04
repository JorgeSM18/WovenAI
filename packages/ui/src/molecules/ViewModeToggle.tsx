import { Pressable, View } from 'react-native';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type ViewModeOption = {
  value: string;
  label: string;
};

export type ViewModeToggleProps = {
  options: ViewModeOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Segmented control (e.g. Editorial / Compact / Categories). */
export function ViewModeToggle({ options, value, onChange, className }: ViewModeToggleProps) {
  return (
    <View
      accessibilityRole="radiogroup"
      className={cn('flex-row rounded-lg bg-surface-container-low p-xs', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={cn(
              'min-h-touch-target-min items-center justify-center rounded-md px-md',
              active && 'bg-surface-container-lowest',
            )}
          >
            <Text
              variant="label-caps"
              className={active ? 'text-primary' : 'text-on-surface-variant'}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
