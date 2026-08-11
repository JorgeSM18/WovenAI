import { useOutfits } from '@woven/data';
import { Fab, Text } from '@woven/ui';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

export default function OutfitsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const outfits = useOutfits(userId);
  const items = outfits.data ?? [];
  const isEmpty = items.length === 0 && !outfits.isPending;

  return (
    <View className="flex-1 bg-background">
      <View className="px-md pt-md">
        <Text variant="display-lg" className="text-on-surface">
          Outfits
        </Text>
      </View>

      {isEmpty ? (
        <View className="flex-1 items-center justify-center p-lg">
          <Text variant="body-md" className="text-center text-on-surface-variant">
            Tap the + button to create your first outfit in the Studio.
          </Text>
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          refreshing={outfits.isRefetching}
          onRefresh={() => void outfits.refetch()}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={item.name}
              onPress={() => router.push(`/outfit/${item.id}`)}
              className="border-b border-outline-variant px-md py-md"
            >
              <Text variant="body-lg" className="text-on-surface">
                {item.name}
              </Text>
            </Pressable>
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
          accessibilityLabel="Create outfit"
          onPress={() => router.push('/studio')}
        />
      </View>
    </View>
  );
}
