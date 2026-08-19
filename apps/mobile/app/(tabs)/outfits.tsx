import { useOutfits } from '@woven/data';
import { AppHeader, Fab, Icon, Text } from '@woven/ui';
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
      <AppHeader
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            onPress={() => router.push('/profile')}
            className="h-9 w-9 rounded-full bg-surface-container"
          />
        }
      />

      <View className="gap-base px-md pt-md">
        <Text variant="headline-lg-mobile" className="text-on-surface">
          Tus looks
        </Text>
        <Text variant="body-md" className="text-on-surface-variant">
          {items.length} {items.length === 1 ? 'look guardado' : 'looks guardados'}
        </Text>
      </View>

      {isEmpty ? (
        <View className="flex-1 items-center justify-center p-lg">
          <Text variant="body-md" className="text-center text-on-surface-variant">
            Pulsa el botón + para crear tu primer look en el Estudio.
          </Text>
        </View>
      ) : (
        <FlashList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 8 }}
          refreshing={outfits.isRefetching}
          onRefresh={() => void outfits.refetch()}
          renderItem={({ item }) => (
            <View className="p-xs" style={{ flex: 1 / 2 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.name}
                onPress={() => router.push(`/outfit/${item.id}`)}
                className="gap-xs"
              >
                <View className="aspect-square w-full rounded-lg bg-surface-container" />
                <Text variant="body-md" className="text-on-surface" numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <View className="absolute bottom-lg right-md">
        <Fab
          icon={<Icon name="plus" size={24} className="text-on-primary" />}
          accessibilityLabel="Crear look"
          onPress={() => router.push('/studio')}
        />
      </View>
    </View>
  );
}
