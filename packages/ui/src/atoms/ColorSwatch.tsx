import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '../utils/cn';

export type ColorSwatchProps = Omit<PressableProps, 'children'> & {
  /** A concrete color value (hex/rgb) — this is data, not a design token. */
  color: string;
  selected?: boolean;
  accessibilityLabel: string;
  className?: string;
};

/** Selectable color swatch (circular). */
export function ColorSwatch({
  color,
  selected = false,
  accessibilityLabel,
  className,
  ...props
}: ColorSwatchProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      className={cn(
        'h-touch-target-min w-touch-target-min items-center justify-center rounded-full',
        className,
      )}
      {...props}
    >
      <View
        className={cn('h-lg w-lg rounded-full', selected && 'border-2 border-primary')}
        style={{ backgroundColor: color }}
      />
    </Pressable>
  );
}
