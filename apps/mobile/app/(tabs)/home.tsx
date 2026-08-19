import { useForgottenGarments, useGarmentCount } from '@woven/data';
import { AppHeader, GarmentCard, StatCard, Text } from '@woven/ui';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

function greeting(hour: number): string {
  if (hour < 12) return 'Buenos días';
  if (hour < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const forgotten = useForgottenGarments(userId);
  const garmentCount = useGarmentCount(userId);

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={forgotten.isRefetching}
            onRefresh={() => void forgotten.refetch()}
          />
        }
      >
        <View className="gap-lg p-md">
          {/* Hero "El look de hoy": the AI outfit + weather recommendation is
              PD-05 (T-0702). Charcoal stub keeps the layout intact until it lands. */}
          <View className="gap-sm rounded-lg bg-primary p-md">
            <Text variant="label-caps" className="text-inverse-primary">
              El look de hoy
            </Text>
            <Text variant="headline-lg-mobile" className="text-on-primary">
              {greeting(new Date().getHours())}
            </Text>
            <Text variant="body-md" className="text-on-primary-container">
              Tus recomendaciones de outfit con IA llegan muy pronto.
            </Text>
          </View>

          <StatCard
            label="Prendas en tu armario"
            value={garmentCount.isSuccess ? String(garmentCount.data) : '—'}
          />

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Piezas olvidadas
            </Text>
            {forgotten.data && forgotten.data.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-sm">
                  {forgotten.data.map((garment) => (
                    <View key={garment.id} style={{ width: 140 }}>
                      <GarmentCard
                        name={garment.name}
                        imageUri={garment.thumbnailUrl}
                        isFavorite={garment.isFavorite}
                        onPress={() => router.push(`/garment/${garment.id}`)}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <Text variant="body-md" className="text-on-surface-variant">
                Nada cogiendo polvo — usas bien tu armario.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
