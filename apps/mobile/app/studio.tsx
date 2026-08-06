import type { WardrobeItem } from '@woven/data';
import { useGarments, useSaveOutfit } from '@woven/data';
import { Button, FullScreenFlowTemplate, IconButton, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

type CanvasItem = {
  garmentId: string;
  thumbnailUrl: string | null;
  posX: number;
  posY: number;
  zIndex: number;
};

// Free-form canvas coordinates/sizes are inherently pixel-based, not tokens.
const STEP = 24;
const ITEM_W = 110;
const ITEM_H = 150;

/**
 * Studio (T-0607 + basic canvas). Tap garments in the tray to add them to the
 * canvas and save the outfit. Real touch drag / layers / undo are T-0602/03/06
 * (gesture-handler + reanimated, device-only) — items cascade by default here.
 */
export default function StudioScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const garments = useGarments(userId);
  const save = useSaveOutfit(userId);
  const [items, setItems] = useState<CanvasItem[]>([]);

  const add = (garment: WardrobeItem) => {
    setItems((prev) => [
      ...prev,
      {
        garmentId: garment.id,
        thumbnailUrl: garment.thumbnailUrl,
        posX: STEP * prev.length,
        posY: STEP * prev.length,
        zIndex: prev.length,
      },
    ]);
  };

  const removeAt = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const onSave = () => {
    if (items.length === 0) return;
    save.mutate(
      {
        name: 'Outfit',
        items: items.map((item) => ({
          garmentId: item.garmentId,
          posX: item.posX,
          posY: item.posY,
          zIndex: item.zIndex,
        })),
      },
      { onSuccess: () => router.back() },
    );
  };

  const header = (
    <View className="flex-row items-center gap-sm border-b border-outline-variant bg-surface px-md py-sm">
      <IconButton
        icon={
          <Text variant="headline-md" className="text-on-surface">
            ‹
          </Text>
        }
        accessibilityLabel="Cancel"
        onPress={() => router.back()}
      />
      <Text variant="title-sm" className="flex-1 text-on-surface">
        New outfit
      </Text>
      <Button
        label={save.isPending ? 'Saving…' : 'Save'}
        disabled={items.length === 0 || save.isPending}
        onPress={onSave}
      />
    </View>
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <View className="flex-1 bg-surface-container-lowest">
        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center p-lg">
            <Text variant="body-md" className="text-center text-on-surface-variant">
              Tap garments below to build your outfit.
            </Text>
          </View>
        ) : (
          items.map((item, index) => (
            <Pressable
              key={`${item.garmentId}-${index}`}
              accessibilityLabel="Remove from outfit"
              onPress={() => removeAt(index)}
              style={{
                position: 'absolute',
                left: item.posX,
                top: item.posY,
                zIndex: item.zIndex,
                width: ITEM_W,
                height: ITEM_H,
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
            </Pressable>
          ))
        )}
      </View>

      <View className="gap-sm border-t border-outline-variant bg-surface p-md">
        <Text variant="label-caps" className="text-on-surface-variant">
          Tap to add
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-sm">
            {(garments.data ?? []).map((garment) => (
              <Pressable
                key={garment.id}
                accessibilityLabel={`Add ${garment.name}`}
                onPress={() => add(garment)}
                style={{ width: 72 }}
              >
                <View className="aspect-[3/4] overflow-hidden rounded-lg bg-surface-container">
                  {garment.thumbnailUrl ? (
                    <Image
                      source={{ uri: garment.thumbnailUrl }}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : null}
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </FullScreenFlowTemplate>
  );
}
