import { useOutfit } from '@woven/data';
import { FlowHeader, FullScreenFlowTemplate, Skeleton, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

// Same item box as the Studio canvas so saved positions reproduce faithfully.
const ITEM_W = 110;
const ITEM_H = 150;

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const outfit = useOutfit(id ?? '');

  return (
    <FullScreenFlowTemplate
      header={<FlowHeader title={outfit.data?.name ?? 'Look'} onBack={() => router.back()} />}
    >
      <View className="flex-1 bg-surface-container-lowest">
        {outfit.isPending ? (
          <View className="p-md">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          </View>
        ) : outfit.isError ? (
          <View className="p-md">
            <Text variant="body-md" className="text-error">
              No pudimos cargar este look.
            </Text>
          </View>
        ) : (
          outfit.data.items.map((item) => (
            <View
              key={item.garmentId}
              accessibilityLabel="Elemento del look"
              style={{
                position: 'absolute',
                left: item.posX,
                top: item.posY,
                width: ITEM_W,
                height: ITEM_H,
                zIndex: item.zIndex,
                transform: [{ scale: item.scale }, { rotate: `${item.rotation}rad` }],
              }}
            >
              <View
                className="overflow-hidden rounded-lg bg-surface-container"
                style={{ width: '100%', height: '100%' }}
              >
                {item.thumbnailUrl ? (
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>
    </FullScreenFlowTemplate>
  );
}
