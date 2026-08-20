import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Icon } from '../atoms/Icon';
import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type GarmentCardProps = {
  name: string;
  /** Optional category eyebrow shown above the name (editorial label). */
  category?: string;
  /** Signed thumbnail URL; a placeholder shows while absent. */
  imageUri?: string | null;
  isFavorite?: boolean;
  onPress?: () => void;
  className?: string;
};

/** Wardrobe grid item: garment thumbnail with its name (and optional category). */
export function GarmentCard({
  name,
  category,
  imageUri,
  isFavorite,
  onPress,
  className,
}: GarmentCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category ? `${name}, ${category}` : name}
      onPress={onPress}
      className={cn('gap-xs active:opacity-70', className)}
    >
      <View className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-container">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={{ width: '100%', height: '100%' }}
          />
        ) : null}
        {isFavorite ? (
          <View className="absolute right-xs top-xs">
            <Icon name="heart" size={18} className="text-primary" />
          </View>
        ) : null}
      </View>
      <View className="gap-base">
        {category ? (
          <Text variant="label-caps" className="text-on-surface-variant" numberOfLines={1}>
            {category}
          </Text>
        ) : null}
        <Text variant="body-md" className="text-on-surface" numberOfLines={1}>
          {name}
        </Text>
      </View>
    </Pressable>
  );
}
