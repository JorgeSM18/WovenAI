import { useOutfits } from '@woven/data';
import { AppHeader, Button, EmptyStateTemplate, Fab, Icon, Text } from '@woven/ui';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { ProfileHeaderButton } from '../../src/components/ProfileHeaderButton';
import { useAuth } from '../../src/providers/AuthProvider';

export default function OutfitsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const outfits = useOutfits(userId);
  const items = outfits.data ?? [];
  const isEmpty = items.length === 0 && !outfits.isPending;
  const { width } = useWindowDimensions();
  const columns = Math.max(2, Math.floor(width / 200));

  return (
    <View className="flex-1 bg-background">
      <AppHeader trailing={<ProfileHeaderButton />} />

      <View className="gap-base px-md pt-md">
        <Text variant="headline-lg-mobile" className="text-on-surface">
          Tus looks
        </Text>
        <Text variant="body-md" className="text-on-surface-variant">
          {items.length} {items.length === 1 ? 'look guardado' : 'looks guardados'}
        </Text>
      </View>

      {isEmpty ? (
        <EmptyStateTemplate
          title="Aún no tienes looks"
          description="Combina tus prendas en el Estudio y guarda tu primer look."
          action={<Button label="Crear un look" onPress={() => router.push('/studio')} />}
        />
      ) : (
        <FlashList
          key={columns}
          data={items}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 8 }}
          refreshing={outfits.isRefetching}
          onRefresh={() => void outfits.refetch()}
          renderItem={({ item }) => (
            <View className="p-xs" style={{ flex: 1 / columns }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.name}
                onPress={() => router.push(`/outfit/${item.id}`)}
                className="gap-xs active:opacity-70"
              >
                <View className="aspect-square w-full overflow-hidden rounded-lg bg-surface-container">
                  {item.previewUrls.length > 0 ? (
                    <View className="h-full w-full flex-row flex-wrap">
                      {item.previewUrls.slice(0, 4).map((url, index) => (
                        <Image
                          key={index}
                          source={{ uri: url }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          style={{
                            width: item.previewUrls.length === 1 ? '100%' : '50%',
                            height: item.previewUrls.length <= 2 ? '100%' : '50%',
                          }}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
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
