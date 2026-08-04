import { View } from 'react-native';

import { Text } from '@woven/ui';

/** Temporary screen placeholder used until real feature screens land. */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text variant="display-lg">{title}</Text>
    </View>
  );
}
