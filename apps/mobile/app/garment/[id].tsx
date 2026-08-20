import { useDeleteGarment, useGarment, useMarkGarmentWorn, useSetFavorite } from '@woven/data';
import {
  Button,
  ColorSwatch,
  FlowHeader,
  FullScreenFlowTemplate,
  Icon,
  IconButton,
  Skeleton,
  Text,
} from '@woven/ui';
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
    Alert.alert('Eliminar prenda', 'Esta prenda se quitará de tu armario.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => remove.mutate(garmentId, { onSuccess: () => router.back() }),
      },
    ]);
  };

  const isFavorite = garment.data?.isFavorite ?? false;

  const header = (
    <FlowHeader
      title={garment.data?.name ?? 'Prenda'}
      onBack={() => router.back()}
      trailing={
        garment.data ? (
          <IconButton
            icon={
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                className={isFavorite ? 'text-primary' : 'text-on-surface'}
              />
            }
            accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            onPress={() => setFavorite.mutate({ id: garmentId, isFavorite: !isFavorite })}
          />
        ) : null
      }
    />
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          {garment.isPending ? (
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          ) : garment.isError ? (
            <Text variant="body-md" className="text-error">
              No pudimos cargar esta prenda.
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
                <Attribute label="Categoría" value={garment.data.categoryName} />
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
                  <Attribute label="Temporada" value={capitalize(garment.data.season)} />
                ) : null}
                <Attribute label="Estado" value={capitalize(garment.data.status)} />
              </View>

              <Button
                label={markWorn.isPending ? 'Guardando…' : 'Marcar como usada hoy'}
                disabled={markWorn.isPending}
                onPress={() => markWorn.mutate(garmentId)}
              />

              <Button
                label={remove.isPending ? 'Eliminando…' : 'Eliminar prenda'}
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
