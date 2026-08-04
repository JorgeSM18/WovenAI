import { View } from 'react-native';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type WeatherPillProps = {
  temperature: string;
  condition?: string;
  className?: string;
};

/** Compact weather indicator (glyph + temperature + condition). */
export function WeatherPill({ temperature, condition, className }: WeatherPillProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-xs self-start rounded-full bg-surface-container px-md py-xs',
        className,
      )}
    >
      <Text variant="body-md" className="text-on-surface" accessibilityElementsHidden>
        ☀
      </Text>
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
