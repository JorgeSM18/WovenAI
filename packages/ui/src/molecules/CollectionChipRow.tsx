import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, ScrollView, View } from 'react-native';

import { Chip } from '../atoms/Chip';

export type ChipRowItem = {
  value: string;
  label: string;
  /** Optional element before the label (e.g. a color dot). */
  leading?: ReactNode;
};

export type CollectionChipRowProps = {
  /** Plain strings (value = label) or full items. */
  items: (string | ChipRowItem)[];
  selected?: string | null;
  onSelect?: (value: string) => void;
  className?: string;
};

// Leaves the previous chip peeking in, so it's clear the row scrolls.
const SCROLL_PEEK = 16;

const toItem = (item: string | ChipRowItem): ChipRowItem =>
  typeof item === 'string' ? { value: item, label: item } : item;

/** Horizontally scrolling row of selectable chips. Scrolls the selected chip
 *  into view when the selection changes (e.g. set programmatically by AI). */
export function CollectionChipRow({
  items,
  selected,
  onSelect,
  className,
}: CollectionChipRowProps) {
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef(new Map<string, number>());
  const reduceMotion = useRef(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.current = enabled;
    });
  }, []);

  const scrollTo = useCallback((value: string) => {
    const x = offsets.current.get(value);
    if (x === undefined) return;
    scrollRef.current?.scrollTo({
      x: Math.max(0, x - SCROLL_PEEK),
      animated: !reduceMotion.current,
    });
  }, []);

  useEffect(() => {
    if (selected) scrollTo(selected);
  }, [selected, scrollTo]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
    >
      <View className="flex-row gap-sm">
        {items.map(toItem).map((item) => (
          <Chip
            key={item.value}
            label={item.label}
            leading={item.leading}
            selected={item.value === selected}
            onPress={() => onSelect?.(item.value)}
            onLayout={(event) => {
              offsets.current.set(item.value, event.nativeEvent.layout.x);
              // Selection may arrive before the chips are laid out.
              if (item.value === selected) scrollTo(item.value);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}
