import { View } from 'react-native';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type StatCardProps = {
  label: string;
  value: string;
  className?: string;
};

/** Small card showing a labelled metric (e.g. Total Items / 142). */
export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <View className={cn('gap-xs rounded-lg bg-surface-container-lowest p-md', className)}>
      <Text variant="label-caps" className="text-on-surface-variant">
        {label}
      </Text>
      <Text variant="headline-md" className="text-on-surface">
        {value}
      </Text>
    </View>
  );
}
