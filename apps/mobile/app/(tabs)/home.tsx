import { useForgottenGarments } from '@woven/data';
import { GarmentCard, Text } from '@woven/ui';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { useAuth } from '../../src/providers/AuthProvider';

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const forgotten = useForgottenGarments(userId);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={forgotten.isRefetching}
          onRefresh={() => void forgotten.refetch()}
        />
      }
    >
      <View className="gap-lg p-md">
        <Text variant="display-lg" className="text-on-surface">
          {greeting(new Date().getHours())}
        </Text>

        {/* Today's Look needs the outfit-recommendation AI (T-0702 / PD-05). */}
        <View className="gap-sm">
          <Text variant="label-caps" className="text-on-surface-variant">
            Today&apos;s Look
          </Text>
          <View className="items-center justify-center rounded-lg bg-surface-container-lowest p-lg">
            <Text variant="body-md" className="text-center text-on-surface-variant">
              Outfit suggestions are coming soon.
            </Text>
          </View>
        </View>

        <View className="gap-sm">
          <Text variant="label-caps" className="text-on-surface-variant">
            Forgotten Pieces
          </Text>
          {forgotten.data && forgotten.data.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-sm">
                {forgotten.data.map((garment) => (
                  <View key={garment.id} style={{ width: 120 }}>
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
              Nothing gathering dust — your wardrobe is well used.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
