import type { WardrobeItem } from '@woven/data';
import { useGarments, useSaveOutfit } from '@woven/data';
import { useStudioDraft } from '@woven/store';
import { Button, FullScreenFlowTemplate, IconButton, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { DraggableItem } from '../src/features/studio/DraggableItem';
import { useAuth } from '../src/providers/AuthProvider';

/**
 * Studio (E06). Tap tray garments to add them, then drag to move, pinch to
 * scale, two-finger rotate, tap to bring to front, long press to remove. The
 * composition lives in the draft store (survives navigation, undo/redo); Save
 * persists it via the transactional save_outfit RPC.
 */
export default function StudioScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const garments = useGarments(userId);
  const save = useSaveOutfit(userId);

  const items = useStudioDraft((state) => state.items);
  const addItem = useStudioDraft((state) => state.addItem);
  const moveItem = useStudioDraft((state) => state.moveItem);
  const scaleItem = useStudioDraft((state) => state.scaleItem);
  const rotateItem = useStudioDraft((state) => state.rotateItem);
  const bringToFront = useStudioDraft((state) => state.bringToFront);
  const removeItem = useStudioDraft((state) => state.removeItem);
  const undo = useStudioDraft((state) => state.undo);
  const redo = useStudioDraft((state) => state.redo);
  const reset = useStudioDraft((state) => state.reset);
  const canUndo = useStudioDraft((state) => state.past.length > 0);
  const canRedo = useStudioDraft((state) => state.future.length > 0);

  const add = (garment: WardrobeItem) =>
    addItem({ garmentId: garment.id, thumbnailUrl: garment.thumbnailUrl });

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
          rotation: item.rotation,
          scale: item.scale,
        })),
      },
      {
        onSuccess: () => {
          reset();
          router.back();
        },
      },
    );
  };

  const glyphButton = (glyph: string, label: string, onPress: () => void, disabled: boolean) => (
    <IconButton
      icon={
        <Text variant="headline-md" className={disabled ? 'text-outline' : 'text-on-surface'}>
          {glyph}
        </Text>
      }
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
    />
  );

  const header = (
    <View className="flex-row items-center gap-xs border-b border-outline-variant bg-surface px-md py-sm">
      <IconButton
        icon={
          <Text variant="headline-md" className="text-on-surface">
            ‹
          </Text>
        }
        accessibilityLabel="Cancel"
        onPress={() => router.back()}
      />
      <View className="flex-1" />
      {glyphButton('↶', 'Undo', undo, !canUndo)}
      {glyphButton('↷', 'Redo', redo, !canRedo)}
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
              Tap garments below to add them, then drag, pinch and rotate.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <DraggableItem
              key={item.garmentId}
              item={item}
              onMove={moveItem}
              onScale={scaleItem}
              onRotate={rotateItem}
              onBringToFront={bringToFront}
              onRemove={removeItem}
            />
          ))
        )}
      </View>

      <View className="gap-sm border-t border-outline-variant bg-surface p-md">
        <Text variant="label-caps" className="text-on-surface-variant">
          Tap to add · drag / pinch / rotate · long press to remove
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
