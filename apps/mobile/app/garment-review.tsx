import type { Season } from '@woven/core';
import { useCategories, useColors, useCreateGarment } from '@woven/data';
import { Button, Chip, FullScreenFlowTemplate, IconButton, Input, Text } from '@woven/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
];

/**
 * Review & create a garment from a captured image (T-0406 manual / T-0407).
 * AI pre-fill of the fields (classification) is blocked by PD-05, so fields are
 * entered manually here; Category and Color are required.
 */
export default function GarmentReviewScreen() {
  const { imageId, uri } = useLocalSearchParams<{ imageId: string; uri: string }>();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const categories = useCategories();
  const colors = useColors();
  const create = useCreateGarment(userId);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0 && categoryId !== null && colorId !== null;

  const save = async () => {
    if (!canSave || !userId) return;
    setError(null);
    try {
      await create.mutateAsync({
        userId,
        name: name.trim(),
        categoryId,
        primaryColorId: colorId,
        season,
        originalImageId: imageId ?? null,
      });
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
        New garment
      </Text>
    </View>
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          {uri ? (
            <View className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-container">
              <Image
                source={{ uri }}
                resizeMode="cover"
                className="h-full w-full"
                accessibilityLabel="Garment photo"
              />
            </View>
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
