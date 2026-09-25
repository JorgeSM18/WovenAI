import { useForgottenGarments, useGarmentCount } from '@woven/data';
import { AppHeader, GarmentCard, StatCard, Text } from '@woven/ui';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { ProfileHeaderButton } from '../../src/components/ProfileHeaderButton';
import { categoryLabel } from '../../src/features/garment/labels';
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
      <AppHeader trailing={<ProfileHeaderButton />} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={forgotten.isRefetching}
            onRefresh={() => void forgotten.refetch()}
          />
        }
      >
        <View className="gap-md p-md">
          {/* Hero "El look de hoy": the AI outfit + weather recommendation is
              PD-05 (T-0702). Until it lands, this is an intentional reserved
              slot (charcoal card + "Próximamente" tag), not a flat stub. */}
          <View className="gap-sm rounded-xl bg-primary p-md">
            <View className="flex-row items-center justify-between gap-sm">
              <Text variant="label-caps" className="flex-1 text-on-primary/70" numberOfLines={1}>
                El look de hoy
              </Text>
              <View className="shrink-0 rounded-full bg-on-primary/15 px-sm py-xs">
                <Text variant="label-caps" className="text-on-primary">
                  Próximamente
                </Text>
              </View>
            </View>
            <Text variant="headline-lg-mobile" className="text-on-primary">
              {greeting(new Date().getHours())}
            </Text>
            <Text variant="body-md" className="text-on-primary/80">
              Tu outfit recomendado con IA según el clima aparecerá aquí.
            </Text>
          </View>

          <StatCard
            label="Prendas en tu armario"
            value={garmentCount.isSuccess ? String(garmentCount.data) : '—'}
          />

          <View className="gap-sm">
            <View className="gap-base">
              <Text variant="headline-md" className="text-on-surface">
                Piezas olvidadas
              </Text>
              <Text variant="body-md" className="text-on-surface-variant">
                Prendas que no usas hace más de 60 días.
              </Text>
            </View>
            {forgotten.data && forgotten.data.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-sm">
                  {forgotten.data.map((garment) => (
                    <View key={garment.id} style={{ width: 140 }}>
                      <GarmentCard
                        name={garment.name}
                        category={garment.categoryName && categoryLabel(garment.categoryName)}
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
