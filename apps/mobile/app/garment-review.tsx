import type { Season } from '@woven/core';
import {
  useCategories,
  useClassifyGarment,
  useColors,
  useCreateGarment,
  useRemoveBackground,
} from '@woven/data';
import { useImportQueue, usePendingUploads } from '@woven/store';
import { Button, Chip, FlowHeader, FullScreenFlowTemplate, Input, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Primavera' },
  { value: 'summer', label: 'Verano' },
  { value: 'fall', label: 'Otoño' },
  { value: 'winter', label: 'Invierno' },
];

/**
 * Review & create a garment (T-0406 manual / T-0407). Handles three sources:
 * a single online capture (params.imageId), an offline capture (params.offline —
 * the image upload is deferred and enqueued), and the import queue (T-0409 —
 * reviewed one item at a time). "Sugerir con IA" removes the background first
 * (self-hosted) and classifies the *processed* image, so the original photo of
 * a person never reaches an external AI (ADR-016).
 */
export default function GarmentReviewScreen() {
  const params = useLocalSearchParams<{
    imageId?: string;
    uri?: string;
    offline?: string;
    width?: string;
    height?: string;
  }>();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const categories = useCategories();
  const colors = useColors();
  const create = useCreateGarment(userId);
  const classify = useClassifyGarment();
  const removeBg = useRemoveBackground();

  const importItem = useImportQueue((state) => state.items[0]);
  const importCount = useImportQueue((state) => state.items.length);
  const dequeueImport = useImportQueue((state) => state.dequeue);
  const enqueuePending = usePendingUploads((state) => state.enqueue);

  const imageId = importItem?.imageId ?? params.imageId ?? null;
  const previewUri = importItem?.uri ?? params.uri;
  const isOffline = params.offline === '1' && !importItem;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [processedImageId, setProcessedImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0 && categoryId !== null && colorId !== null;

  const resetForm = () => {
    setName('');
    setCategoryId(null);
    setColorId(null);
    setSeason(null);
    setProcessedImageId(null);
    setError(null);
  };

  const suggest = async () => {
    if (!imageId) return;
    try {
      // Privacy (ADR-016): remove the background first (self-hosted) and classify
      // the processed image — the original never reaches the external AI. Reuse
      // the processed image if a previous suggestion already produced one.
      const processedId = processedImageId ?? (await removeBg.mutateAsync(imageId));
      setProcessedImageId(processedId);
      const result = await classify.mutateAsync(processedId);
      const category = categories.data?.find(
        (c) => c.name.toLowerCase() === result.categoryName?.toLowerCase(),
      );
      if (category) setCategoryId(category.id);
      const color = colors.data?.find(
        (c) => c.name.toLowerCase() === result.colorName?.toLowerCase(),
      );
      if (color) setColorId(color.id);
      const seasonMatch = SEASONS.find((s) => s.value === result.season);
      if (seasonMatch) setSeason(seasonMatch.value);
      if (name.trim().length === 0) {
        const suggested = [result.colorName, result.categoryName].filter(Boolean).join(' ').trim();
        if (suggested) setName(suggested);
      }
    } catch {
      // AI unavailable — the manual form still works.
    }
  };

  const save = async () => {
    if (!canSave || !userId) return;
    setError(null);
    try {
      const newGarmentId = await create.mutateAsync({
        userId,
        name: name.trim(),
        categoryId,
        primaryColorId: colorId,
        season,
        originalImageId: imageId,
        processedImageId,
      });

      if (isOffline && params.uri) {
        enqueuePending({
          id: `${Date.now()}-${Math.random()}`,
          garmentId: newGarmentId,
          uri: params.uri,
          type: 'original',
          mime: 'image/jpeg',
          width: Number(params.width ?? 0),
          height: Number(params.height ?? 0),
        });
      }

      if (importItem) {
        dequeueImport();
        if (importCount > 1) {
          resetForm();
          return;
        }
      }
      router.replace('/home');
    } catch {
      setError('No se pudo guardar la prenda. Inténtalo de nuevo.');
    }
  };

  const header = (
    <FlowHeader
      title={importCount > 1 ? `Nueva prenda (quedan ${importCount})` : 'Nueva prenda'}
      onBack={() => router.back()}
    />
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          {previewUri ? (
            <View className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-container">
              <Image
                source={{ uri: previewUri }}
                contentFit="cover"
                className="h-full w-full"
                accessibilityLabel="Foto de la prenda"
              />
            </View>
          ) : null}

          {isOffline ? (
            <Text variant="body-md" className="text-on-surface-variant">
              Estás sin conexión — la foto se subirá automáticamente cuando vuelvas a conectarte.
            </Text>
          ) : null}

          {imageId ? (
            <Button
              label={removeBg.isPending || classify.isPending ? 'Analizando…' : 'Sugerir con IA'}
              variant="secondary"
              disabled={removeBg.isPending || classify.isPending}
              onPress={() => {
                void suggest();
              }}
            />
          ) : null}

          <Input
            label="Nombre"
            placeholder="p. ej. Camisa de lino azul"
            value={name}
            onChangeText={setName}
          />

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Categoría
            </Text>
            <View className="flex-row flex-wrap gap-sm">
              {categories.data?.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </View>
          </View>

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Color
            </Text>
            <View className="flex-row flex-wrap gap-sm">
              {colors.data?.map((color) => (
                <Chip
                  key={color.id}
                  label={color.name}
                  selected={colorId === color.id}
                  onPress={() => setColorId(color.id)}
                />
              ))}
            </View>
          </View>

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Temporada (opcional)
            </Text>
            <View className="flex-row flex-wrap gap-sm">
              {SEASONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={season === option.value}
                  onPress={() => setSeason(season === option.value ? null : option.value)}
                />
              ))}
            </View>
          </View>

          {error ? (
            <Text variant="body-md" className="text-error">
              {error}
            </Text>
          ) : null}

          <Button
            label={create.isPending ? 'Guardando…' : 'Guardar prenda'}
            disabled={!canSave || create.isPending}
            onPress={() => {
              void save();
            }}
          />
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
