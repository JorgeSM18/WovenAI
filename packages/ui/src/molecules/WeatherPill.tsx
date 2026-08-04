import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type WeatherPillProps = {
  temperature: string;
  condition?: string;
  /** Optional weather icon. No default: a fixed glyph would misrepresent the condition. */
  icon?: ReactNode;
  className?: string;
};

/** Compact weather indicator (optional icon + temperature + condition). */
export function WeatherPill({ temperature, condition, icon, className }: WeatherPillProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-xs self-start rounded-full bg-surface-container px-md py-xs',
        className,
      )}
    >
      {icon}
      <Text variant="label-caps" className="text-on-surface">
        {temperature}
      </Text>
      {condition ? (
        <Text variant="label-caps" className="text-on-surface-variant">
          {condition}
        </Text>
      ) : null}
    </View>
  );
}
