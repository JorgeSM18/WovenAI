import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { Icon } from '../atoms/Icon';
import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type GarmentCardProps = {
  name: string;
  /** Signed thumbnail URL; a placeholder shows while absent. */
  imageUri?: string | null;
  isFavorite?: boolean;
  onPress?: () => void;
  className?: string;
};

/** Wardrobe grid item: garment thumbnail with its name. */
export function GarmentCard({ name, imageUri, isFavorite, onPress, className }: GarmentCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      className={cn('gap-xs', className)}
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
      <Text variant="body-md" className="text-on-surface" numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}
