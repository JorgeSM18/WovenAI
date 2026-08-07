import type { WardrobeItem } from '@woven/data';
import { useGarments, useSaveOutfit } from '@woven/data';
import { Button, FullScreenFlowTemplate, IconButton, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { DraggableItem, type CanvasItem } from '../src/features/studio/DraggableItem';
import { useAuth } from '../src/providers/AuthProvider';

const STEP = 24;

/**
 * Studio (E06). Tap tray garments to add them to the canvas, then drag to move,
 * tap to bring to front (z-index), long press to remove. Save persists the
 * composed outfit via the transactional save_outfit RPC.
 */
export default function StudioScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const garments = useGarments(userId);
  const save = useSaveOutfit(userId);
  const [items, setItems] = useState<CanvasItem[]>([]);

  const add = (garment: WardrobeItem) => {
    setItems((prev) => {
      if (prev.some((item) => item.garmentId === garment.id)) return prev;
      return [
        ...prev,
        {
          garmentId: garment.id,
          thumbnailUrl: garment.thumbnailUrl,
          posX: STEP * prev.length,
          posY: STEP * prev.length,
          zIndex: prev.length,
        },
      ];
    });
  };

  const moveTo = (garmentId: string, posX: number, posY: number) =>
    setItems((prev) =>
      prev.map((item) => (item.garmentId === garmentId ? { ...item, posX, posY } : item)),
    );

  const bringToFront = (garmentId: string) =>
    setItems((prev) => {
      const max = prev.reduce((acc, item) => Math.max(acc, item.zIndex), -1);
      return prev.map((item) =>
        item.garmentId === garmentId ? { ...item, zIndex: max + 1 } : item,
      );
    });

  const remove = (garmentId: string) =>
    setItems((prev) => prev.filter((item) => item.garmentId !== garmentId));

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
              Tap garments below to add them, then drag to arrange.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <DraggableItem
              key={item.garmentId}
              item={item}
              onMove={moveTo}
              onBringToFront={bringToFront}
              onRemove={remove}
            />
          ))
        )}
      </View>

      <View className="gap-sm border-t border-outline-variant bg-surface p-md">
        <Text variant="label-caps" className="text-on-surface-variant">
          Tap to add · drag to move · long press to remove
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
