import { useDeleteGarment, useGarment, useMarkGarmentWorn, useSetFavorite } from '@woven/data';
import { Button, ColorSwatch, FullScreenFlowTemplate, IconButton, Skeleton, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text variant="label-caps" className="text-on-surface-variant">
        {label}
      </Text>
      <Text variant="body-lg" className="text-on-surface">
        {value}
      </Text>
    </View>
  );
}

export default function GarmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const garmentId = id ?? '';
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const garment = useGarment(garmentId);
  const setFavorite = useSetFavorite(userId);
  const markWorn = useMarkGarmentWorn(userId);
  const remove = useDeleteGarment(userId);

  const confirmDelete = () => {
    Alert.alert('Delete garment', 'This garment will be removed from your wardrobe.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove.mutate(garmentId, { onSuccess: () => router.back() }),
      },
    ]);
  };

  const isFavorite = garment.data?.isFavorite ?? false;

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
      <Text variant="title-sm" className="flex-1 text-on-surface" numberOfLines={1}>
        {garment.data?.name ?? 'Garment'}
      </Text>
      {garment.data ? (
        <IconButton
          icon={
            <Text variant="headline-md" className={isFavorite ? 'text-primary' : 'text-on-surface'}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          }
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onPress={() => setFavorite.mutate({ id: garmentId, isFavorite: !isFavorite })}
        />
      ) : null}
    </View>
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          {garment.isPending ? (
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          ) : garment.isError ? (
            <Text variant="body-md" className="text-error">
              We couldn&apos;t load this garment.
            </Text>
          ) : (
            <>
              <View className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-container">
                {garment.data.imageUrl ? (
                  <Image
                    source={{ uri: garment.data.imageUrl }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : null}
              </View>

              <Text variant="headline-md" className="text-on-surface">
                {garment.data.name}
              </Text>

              <View className="gap-md">
                <Attribute label="Category" value={garment.data.categoryName} />
                <View className="flex-row items-center justify-between">
                  <Text variant="label-caps" className="text-on-surface-variant">
                    Color
                  </Text>
                  <View className="flex-row items-center gap-sm">
                    <Text variant="body-lg" className="text-on-surface">
                      {garment.data.colorName}
                    </Text>
                    <ColorSwatch
                      color={garment.data.colorHex}
                      accessibilityLabel={garment.data.colorName}
                    />
                  </View>
                </View>
                {garment.data.season ? (
                  <Attribute label="Season" value={capitalize(garment.data.season)} />
                ) : null}
                <Attribute label="Status" value={capitalize(garment.data.status)} />
              </View>

              <Button
                label={markWorn.isPending ? 'Saving…' : 'Mark as worn today'}
                disabled={markWorn.isPending}
                onPress={() => markWorn.mutate(garmentId)}
              />

              <Button
                label={remove.isPending ? 'Deleting…' : 'Delete garment'}
                variant="secondary"
                disabled={remove.isPending}
                onPress={confirmDelete}
              />
            </>
          )}
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
