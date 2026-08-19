import { useGarments } from '@woven/data';
import {
  AppHeader,
  EmptyStateTemplate,
  Fab,
  GarmentCard,
  Icon,
  SearchBar,
  Text,
  ViewModeToggle,
} from '@woven/ui';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

const VIEW_MODES = [
  { value: 'editorial', label: 'Editorial' },
  { value: 'compacto', label: 'Compacto' },
];

export default function InventoryScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const garments = useGarments(userId);
  const items = garments.data ?? [];

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('editorial');
  const term = query.trim().toLowerCase();
  const filtered = term ? items.filter((item) => item.name.toLowerCase().includes(term)) : items;

  const isEmpty = items.length === 0 && !garments.isPending;
  const columns = mode === 'compacto' ? 2 : 1;

  return (
    <View className="flex-1 bg-background">
      <AppHeader
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            onPress={() => router.push('/profile')}
            className="h-9 w-9 rounded-full bg-surface-container"
          />
        }
      />

      <View className="gap-md px-md pt-md">
        <View className="gap-base">
          <Text variant="headline-lg-mobile" className="text-on-surface">
            Tu inventario
          </Text>
          <Text variant="body-md" className="text-on-surface-variant">
            {items.length} {items.length === 1 ? 'prenda' : 'prendas'} en tu armario
          </Text>
        </View>
        {!isEmpty ? (
          <>
            <SearchBar placeholder="Busca en tu armario…" value={query} onChangeText={setQuery} />
            <ViewModeToggle options={VIEW_MODES} value={mode} onChange={setMode} />
          </>
        ) : null}
      </View>

      {isEmpty ? (
        <EmptyStateTemplate
          title="Tu armario está vacío"
          description="Pulsa el botón + para añadir tu primera prenda."
        />
      ) : filtered.length === 0 ? (
        <View className="p-md">
          <Text variant="body-md" className="text-on-surface-variant">
            Ninguna prenda coincide con «{query.trim()}».
          </Text>
        </View>
      ) : (
        <FlashList
          key={mode}
          data={filtered}
          numColumns={columns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 8 }}
          refreshing={garments.isRefetching}
          onRefresh={() => void garments.refetch()}
          renderItem={({ item }) => (
            <View className="p-xs" style={{ flex: 1 / columns }}>
              <GarmentCard
                name={item.name}
                imageUri={item.thumbnailUrl}
                isFavorite={item.isFavorite}
                onPress={() => router.push(`/garment/${item.id}`)}
              />
            </View>
          )}
        />
      )}

      <View className="absolute bottom-lg right-md">
        <Fab
          icon={<Icon name="plus" size={24} className="text-on-primary" />}
          accessibilityLabel="Añadir prenda"
          onPress={() => router.push('/capture')}
        />
      </View>
    </View>
  );
}
