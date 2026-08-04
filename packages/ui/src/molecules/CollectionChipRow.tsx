import { ScrollView, View } from 'react-native';

import { Chip } from '../atoms/Chip';

export type CollectionChipRowProps = {
  items: string[];
  selected?: string;
  onSelect?: (item: string) => void;
  className?: string;
};

/** Horizontally scrolling row of selectable collection chips. */
export function CollectionChipRow({
  items,
  selected,
  onSelect,
  className,
}: CollectionChipRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className={className}>
      <View className="flex-row gap-sm">
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={item === selected}
            onPress={() => onSelect?.(item)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
