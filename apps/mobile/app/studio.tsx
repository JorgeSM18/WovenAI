import type { OutfitRecommendation, WardrobeItem } from '@woven/data';
import { useGarments, useRecommendOutfit, useSaveOutfit } from '@woven/data';
import { useStudioDraft } from '@woven/store';
import {
  Button,
  FullScreenFlowTemplate,
  Icon,
  IconButton,
  type IconName,
  Input,
  Text,
} from '@woven/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { DraggableItem } from '../src/features/studio/DraggableItem';
import { useAuth } from '../src/providers/AuthProvider';

const NUDGE = 12;
const SCALE_STEP = 1.15;
const ROTATE_STEP = Math.PI / 12; // 15°

/**
 * Studio (E06). Add tray garments to the canvas, then arrange them by gesture
 * (drag / pinch / rotate) OR, for accessibility (WCAG 2.5.7), select an item and
 * use the single-tap controls. The draft store keeps the composition + undo/redo;
 * Save persists it via the transactional save_outfit RPC.
 */
export default function StudioScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const garments = useGarments(userId);
  const save = useSaveOutfit(userId);
  const recommend = useRecommendOutfit();

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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const selected = items.find((item) => item.garmentId === selectedId) ?? null;

  // A score is only valid for its exact set of garments — clear it when the set changes.
  const itemsKey = items
    .map((item) => item.garmentId)
    .sort()
    .join(',');
  useEffect(() => setRecommendation(null), [itemsKey]);

  const analyze = () => {
    if (items.length < 2) return;
    recommend.mutate(
      items.map((item) => item.garmentId),
      { onSuccess: setRecommendation },
    );
  };

  const add = (garment: WardrobeItem) =>
    addItem({ garmentId: garment.id, thumbnailUrl: garment.thumbnailUrl });

  const removeSelected = () => {
    if (!selected) return;
    removeItem(selected.garmentId);
    setSelectedId(null);
  };

  const onSave = () => {
    if (items.length === 0) return;
    save.mutate(
      {
        name: name.trim() || 'Look',
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
          setSelectedId(null);
          setName('');
          router.back();
        },
      },
    );
  };

  const iconBtn = (name: IconName, label: string, onPress: () => void, disabled = false) => (
    <IconButton
      icon={<Icon name={name} className={disabled ? 'text-outline' : 'text-on-surface'} />}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
    />
  );

  const header = (
    <View className="flex-row items-center gap-xs border-b border-outline-variant bg-surface px-md py-sm">
      {iconBtn('close', 'Cancelar', () => router.back())}
      <View className="flex-1" />
      {iconBtn('undo-variant', 'Deshacer', undo, !canUndo)}
      {iconBtn('redo-variant', 'Rehacer', redo, !canRedo)}
      <Button
        label={save.isPending ? 'Guardando…' : 'Guardar'}
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
              Toca las prendas de abajo para añadirlas y colócalas con gestos o seleccionando un
              elemento.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <DraggableItem
              key={item.garmentId}
              item={item}
              isSelected={item.garmentId === selectedId}
              onMove={moveItem}
              onScale={scaleItem}
              onRotate={rotateItem}
              onSelect={setSelectedId}
              onRemove={removeItem}
            />
          ))
        )}
      </View>

      {/* WCAG 2.5.7: single-tap alternative to drag/pinch/rotate for the selected item. */}
      {selected ? (
        <View className="border-t border-outline-variant bg-surface px-md py-sm">
          <Text variant="label-caps" className="text-on-surface-variant">
            Elemento seleccionado
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center">
              {iconBtn('arrow-left', 'Mover a la izquierda', () =>
                moveItem(selected.garmentId, selected.posX - NUDGE, selected.posY),
              )}
              {iconBtn('arrow-right', 'Mover a la derecha', () =>
                moveItem(selected.garmentId, selected.posX + NUDGE, selected.posY),
              )}
              {iconBtn('arrow-up', 'Mover arriba', () =>
                moveItem(selected.garmentId, selected.posX, selected.posY - NUDGE),
              )}
              {iconBtn('arrow-down', 'Mover abajo', () =>
                moveItem(selected.garmentId, selected.posX, selected.posY + NUDGE),
              )}
              {iconBtn('magnify-plus-outline', 'Agrandar', () =>
                scaleItem(selected.garmentId, selected.scale * SCALE_STEP),
              )}
              {iconBtn('magnify-minus-outline', 'Reducir', () =>
                scaleItem(selected.garmentId, selected.scale / SCALE_STEP),
              )}
              {iconBtn('rotate-left', 'Girar a la izquierda', () =>
                rotateItem(selected.garmentId, selected.rotation - ROTATE_STEP),
              )}
              {iconBtn('rotate-right', 'Girar a la derecha', () =>
                rotateItem(selected.garmentId, selected.rotation + ROTATE_STEP),
              )}
              {iconBtn('arrange-bring-to-front', 'Traer al frente', () =>
                bringToFront(selected.garmentId),
              )}
              {iconBtn('delete-outline', 'Quitar', removeSelected)}
            </View>
          </ScrollView>
        </View>
      ) : null}

      {items.length >= 2 ? (
        <View className="gap-xs border-t border-outline-variant bg-surface px-md py-sm">
          <View className="flex-row items-center justify-between gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Coherencia del look
            </Text>
            {recommendation?.matchScore != null ? (
              <Text variant="title-sm" className="text-on-surface">
                Match {recommendation.matchScore}
              </Text>
            ) : (
              <Button
                label={recommend.isPending ? 'Analizando…' : 'Analizar con IA'}
                variant="secondary"
                disabled={recommend.isPending}
                onPress={analyze}
              />
            )}
          </View>
          {recommendation?.matchScore != null ? (
            <>
              {recommendation.suggestions.map((tip, index) => (
                <Text key={`s${index}`} variant="body-md" className="text-on-surface-variant">
                  · {tip}
                </Text>
              ))}
              {recommendation.conflicts.map((conflict, index) => (
                <Text key={`c${index}`} variant="body-md" className="text-error">
                  · {conflict}
                </Text>
              ))}
            </>
          ) : recommendation ? (
            <Text variant="body-md" className="text-on-surface-variant">
              La IA no está disponible ahora.
            </Text>
          ) : null}
        </View>
      ) : null}

      {items.length > 0 ? (
        <View className="border-t border-outline-variant bg-surface px-md pt-sm">
          <Input
            label="Nombre del look"
            placeholder="Mi look"
            value={name}
            onChangeText={setName}
          />
        </View>
      ) : null}

      <View className="gap-sm border-t border-outline-variant bg-surface p-md">
        <Text variant="label-caps" className="text-on-surface-variant">
          Toca para añadir · arrastra / pellizca / gira · toca un elemento para más opciones
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-sm">
            {(garments.data ?? []).map((garment) => (
              <Pressable
                key={garment.id}
                accessibilityLabel={`Añadir ${garment.name}`}
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
