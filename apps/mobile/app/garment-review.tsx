import type { Season } from '@woven/core';
import { useCategories, useClassifyGarment, useColors, useCreateGarment } from '@woven/data';
import { useImportQueue, usePendingUploads } from '@woven/store';
import { Button, Chip, FullScreenFlowTemplate, IconButton, Input, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
];

/**
 * Review & create a garment (T-0406 manual / T-0407). Handles three sources:
 * a single online capture (params.imageId), an offline capture (params.offline —
 * the image upload is deferred and enqueued), and the import queue (T-0409 —
 * reviewed one item at a time). AI pre-fill is blocked by PD-05.
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
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0 && categoryId !== null && colorId !== null;

  const resetForm = () => {
    setName('');
    setCategoryId(null);
    setColorId(null);
    setSeason(null);
    setError(null);
  };

  const suggest = async () => {
    if (!imageId) return;
    try {
      const result = await classify.mutateAsync(imageId);
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
      setError('Could not save the garment. Please try again.');
    }
  };

  const header = (
    <View className="flex-row items-center gap-sm border-b border-outline-variant bg-surface px-md py-sm">
      <IconButton
        icon={
          <Text variant="headline-md" className="text-on-surface">
            ‹
          </Text>
        }
        accessibilityLabel="Go back"
        onPress={() => router.back()}
      />
      <Text variant="title-sm" className="text-on-surface">
        {importCount > 1 ? `New garment (${importCount} left)` : 'New garment'}
      </Text>
    </View>
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
                accessibilityLabel="Garment photo"
              />
            </View>
          ) : null}

          {isOffline ? (
            <Text variant="body-md" className="text-on-surface-variant">
              You&apos;re offline — the photo will upload automatically once you reconnect.
            </Text>
          ) : null}

          {imageId ? (
            <Button
              label={classify.isPending ? 'Suggesting…' : 'Suggest with AI'}
              variant="secondary"
              disabled={classify.isPending}
              onPress={() => {
                void suggest();
              }}
            />
          ) : null}

          <Input
            label="Name"
            placeholder="e.g. Blue linen shirt"
            value={name}
            onChangeText={setName}
          />

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Category
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
              Season (optional)
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
            label={create.isPending ? 'Saving…' : 'Save garment'}
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
