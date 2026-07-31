import { View } from 'react-native';

import { cn } from '../utils/cn';

export type ProgressBarProps = {
  /** Progress from 0 to 100. */
  value: number;
  className?: string;
};

/** Determinate progress bar. */
export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      className={cn(
        'h-1 w-full overflow-hidden rounded-full bg-surface-container-highest',
        className,
      )}
    >
      <View className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
    </View>
  );
}
