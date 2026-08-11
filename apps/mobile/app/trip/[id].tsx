import { enumerateDates } from '@woven/core';
import {
  useAssignOutfitToDay,
  useGarments,
  useOutfits,
  useTrip,
  useTripDays,
  useTripGarments,
  useTripWeather,
  useToggleTripGarment,
} from '@woven/data';
import { Chip, FullScreenFlowTemplate, IconButton, Text } from '@woven/ui';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = id ?? '';
  const { session } = useAuth();
  const userId = session?.user.id ?? '';

  const trip = useTrip(tripId);
  const wardrobe = useGarments(userId);
  const packed = useTripGarments(tripId);
  const togglePacked = useToggleTripGarment(tripId);
  const outfits = useOutfits(userId);
  const days = useTripDays(tripId);
  const assign = useAssignOutfitToDay(tripId);
  const weather = useTripWeather(tripId);

  const packedIds = new Set(packed.data?.map((item) => item.garmentId));
  const outfitByDate = new Map(days.data?.map((day) => [day.date, day.outfitId]));
  const weatherByDate = new Map(weather.data?.map((snapshot) => [snapshot.date, snapshot]));
  const outfitName = new Map(outfits.data?.map((outfit) => [outfit.id, outfit.name]));
  const dates = trip.data ? enumerateDates(trip.data.startDate, trip.data.endDate) : [];

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
        {trip.data?.destination ?? 'Trip'}
      </Text>
    </View>
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          {trip.data ? (
            <Text variant="body-md" className="text-on-surface-variant">
              {trip.data.startDate} → {trip.data.endDate}
            </Text>
          ) : null}

          {/* Packing: tap a garment to add/remove it from the suitcase. */}
          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Packing ({packedIds.size})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-sm">
                {(wardrobe.data ?? []).map((garment) => {
                  const isPacked = packedIds.has(garment.id);
                  return (
                    <Pressable
                      key={garment.id}
                      accessibilityLabel={`${isPacked ? 'Remove' : 'Add'} ${garment.name}`}
                      accessibilityState={{ selected: isPacked }}
                      onPress={() =>
                        togglePacked.mutate({ garmentId: garment.id, packed: isPacked })
                      }
                      style={{ width: 72 }}
                    >
                      <View
                        className={`aspect-[3/4] overflow-hidden rounded-lg bg-surface-container ${
                          isPacked ? 'border-2 border-primary' : ''
                        }`}
                      >
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
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Outfit per day. */}
          <View className="gap-md">
            <Text variant="label-caps" className="text-on-surface-variant">
              Days
            </Text>
            {dates.map((date) => {
              const assignedId = outfitByDate.get(date) ?? null;
              const forecast = weatherByDate.get(date);
              return (
                <View key={date} className="gap-xs">
                  <Text variant="body-lg" className="text-on-surface">
                    {date}
                    {assignedId ? ` · ${outfitName.get(assignedId) ?? 'Outfit'}` : ''}
                  </Text>
                  {forecast?.condition || forecast?.temp_c != null ? (
                    <Text variant="body-md" className="text-on-surface-variant">
                      {forecast.temp_c != null ? `${Math.round(forecast.temp_c)}°C` : ''}
                      {forecast.temp_c != null && forecast.condition ? ' · ' : ''}
                      {forecast.condition ?? ''}
                    </Text>
                  ) : null}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-sm">
                      {(outfits.data ?? []).map((outfit) => (
                        <Chip
                          key={outfit.id}
                          label={outfit.name}
                          selected={assignedId === outfit.id}
                          onPress={() => assign.mutate({ date, outfitId: outfit.id })}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
