import { useTrips } from '@woven/data';
import { Fab, Text } from '@woven/ui';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

export default function TripsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const trips = useTrips(userId);
  const items = trips.data ?? [];
  const isEmpty = items.length === 0 && !trips.isPending;

  return (
    <View className="flex-1 bg-background">
      <View className="px-md pt-md">
        <Text variant="display-lg" className="text-on-surface">
          Trips
        </Text>
      </View>

      {isEmpty ? (
        <View className="flex-1 items-center justify-center p-lg">
          <Text variant="body-md" className="text-center text-on-surface-variant">
            Tap the + button to plan your first trip.
          </Text>
        </View>
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={item.destination}
              onPress={() => router.push(`/trip/${item.id}`)}
              className="gap-xs border-b border-outline-variant px-md py-md"
            >
              <Text variant="body-lg" className="text-on-surface">
                {item.destination}
              </Text>
              <Text variant="body-md" className="text-on-surface-variant">
                {item.startDate} → {item.endDate}
              </Text>
            </Pressable>
          )}
        />
      )}

      <View className="absolute bottom-lg right-md">
        <Fab
          icon={
            <Text variant="headline-md" className="text-background">
              +
            </Text>
          }
          accessibilityLabel="Plan a trip"
          onPress={() => router.push('/trip-new')}
        />
      </View>
    </View>
  );
}
