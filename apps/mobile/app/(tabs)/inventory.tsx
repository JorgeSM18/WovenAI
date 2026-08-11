import { useGarments } from '@woven/data';
import { EmptyStateTemplate, Fab, GarmentCard, SearchBar, Text } from '@woven/ui';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

export default function InventoryScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const garments = useGarments(userId);
  const items = garments.data ?? [];

  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const filtered = term ? items.filter((item) => item.name.toLowerCase().includes(term)) : items;

  const isEmpty = items.length === 0 && !garments.isPending;

  return (
    <View className="flex-1 bg-background">
      <View className="gap-md px-md pt-md">
        <Text variant="display-lg" className="text-on-surface">
          Wardrobe
        </Text>
        {!isEmpty ? (
          <SearchBar placeholder="Search garments" value={query} onChangeText={setQuery} />
        ) : null}
      </View>

      {isEmpty ? (
        <EmptyStateTemplate
          title="Your wardrobe is empty"
          description="Tap the + button to add your first garment."
        />
      ) : filtered.length === 0 ? (
        <View className="p-md">
          <Text variant="body-md" className="text-on-surface-variant">
            No garments match “{query.trim()}”.
          </Text>
        </View>
      ) : (
        <FlashList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          refreshing={garments.isRefetching}
          onRefresh={() => void garments.refetch()}
          renderItem={({ item }) => (
            <View className="p-xs">
              <GarmentCard
                name={item.name}
                imageUri={item.thumbnailUrl}
                isFavorite={item.isFavorite}
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
