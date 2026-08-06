import { Fab, Text } from '@woven/ui';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function OutfitsScreen() {
  // Outfit list arrives with listOutfits; for now this is the Studio entry point.
  return (
    <View className="flex-1 bg-background">
      <View className="px-md pt-md">
        <Text variant="display-lg" className="text-on-surface">
          Outfits
        </Text>
      </View>

      <View className="flex-1 items-center justify-center p-lg">
        <Text variant="body-md" className="text-center text-on-surface-variant">
          Tap the + button to create your first outfit in the Studio.
        </Text>
      </View>

      <View className="absolute bottom-lg right-md">
        <Fab
          icon={
            <Text variant="headline-md" className="text-background">
              +
            </Text>
          }
          accessibilityLabel="Create outfit"
          onPress={() => router.push('/studio')}
        />
      </View>
    </View>
  );
}
