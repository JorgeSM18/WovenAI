import { useGarments } from '@woven/data';
import { EmptyStateTemplate, Fab, GarmentCard, Text } from '@woven/ui';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

export default function InventoryScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const garments = useGarments(userId);
  const items = garments.data ?? [];

  return (
    <View className="flex-1 bg-background">
      <View className="px-md pt-md">
        <Text variant="display-lg" className="text-on-surface">
          Wardrobe
        </Text>
      </View>

      {items.length === 0 && !garments.isPending ? (
        <EmptyStateTemplate
          title="Your wardrobe is empty"
          description="Tap the + button to add your first garment."
        />
      ) : (
        <FlashList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="p-xs">
              <GarmentCard
                name={item.name}
                imageUri={item.thumbnailUrl}
                onPress={() => router.push(`/garment/${item.id}`)}
              />
            </View>
          )}
        />
      )}

      <View className="absolute bottom-lg right-md">
        <Fab
          icon={
            <Text variant="headline-md" className="text-background">
              +
            </Text>
          }
          accessibilityLabel="Add garment"
          onPress={() => router.push('/capture')}
        />
      </View>
    </View>
  );
}
