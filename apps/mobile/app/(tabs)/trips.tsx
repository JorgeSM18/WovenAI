import { useTrips } from '@woven/data';
import { AppHeader, Badge, Button, EmptyStateTemplate, Fab, Icon, Text } from '@woven/ui';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ProfileHeaderButton } from '../../src/components/ProfileHeaderButton';
import { useAuth } from '../../src/providers/AuthProvider';

const MONTHS_ES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];
const STATUS_LABEL = { upcoming: 'Próximo', active: 'En curso', past: 'Pasado' } as const;

/** "2024-10-12" -> "12 oct" (Hermes-safe, no Intl dependency). Adds the year
 *  when `withYear`, so trips in other years aren't indistinguishable. */
function formatDay(iso: string, withYear = false): string {
  const [year, month, day] = iso.split('-');
  const monthName = MONTHS_ES[Number(month) - 1] ?? '';
  return `${Number(day)} ${monthName}${withYear ? ` ${year}` : ''}`;
}

export default function TripsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const trips = useTrips(userId);
  const items = trips.data ?? [];
  const isEmpty = items.length === 0 && !trips.isPending;

  return (
    <View className="flex-1 bg-background">
      <AppHeader trailing={<ProfileHeaderButton />} />

      <View className="gap-base px-md pt-md">
        <Text variant="headline-lg-mobile" className="text-on-surface">
          Tus viajes
        </Text>
        <Text variant="body-md" className="text-on-surface-variant">
          {items.length} {items.length === 1 ? 'viaje planificado' : 'viajes planificados'}
        </Text>
      </View>

      {isEmpty ? (
        <EmptyStateTemplate
          title="Aún no tienes viajes"
          description="Planifica tu primer viaje y prepara el equipaje según el clima del destino."
          action={<Button label="Planificar viaje" onPress={() => router.push('/trip-new')} />}
        />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshing={trips.isRefetching}
          onRefresh={() => void trips.refetch()}
          renderItem={({ item }) => {
            const currentYear = String(new Date().getFullYear());
            const showYear =
              item.startDate.slice(0, 4) !== currentYear ||
              item.endDate.slice(0, 4) !== currentYear;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.destination}
                onPress={() => router.push(`/trip/${item.id}`)}
                className="mb-sm gap-xs rounded-lg border border-outline-variant bg-surface-container-lowest p-md active:opacity-70"
              >
                <View className="flex-row items-center justify-between gap-sm">
                  <Text variant="title-sm" className="flex-1 text-on-surface" numberOfLines={1}>
                    {item.destination}
                  </Text>
                  <Badge label={STATUS_LABEL[item.status]} />
                </View>
                <Text variant="body-md" className="text-on-surface-variant">
                  {formatDay(item.startDate, showYear)} — {formatDay(item.endDate, showYear)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      <View className="absolute bottom-lg right-md">
        <Fab
          icon={<Icon name="plus" size={24} className="text-on-primary" />}
          accessibilityLabel="Planificar viaje"
          onPress={() => router.push('/trip-new')}
        />
      </View>
    </View>
  );
}
