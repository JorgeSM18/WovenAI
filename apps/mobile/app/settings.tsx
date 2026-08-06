import type { ThemePreference, UnitsPreference } from '@woven/core';
import { useProfile, useUpdateProfile } from '@woven/data';
import { Chip, FullScreenFlowTemplate, IconButton, SettingRow, Text, useTheme } from '@woven/ui';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const UNITS_OPTIONS: { value: UnitsPreference; label: string }[] = [
  { value: 'metric', label: 'Metric' },
  { value: 'imperial', label: 'Imperial' },
];

export default function SettingsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const update = useUpdateProfile(userId);
  const { setMode } = useTheme();

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
      <Text variant="title-sm" className="text-on-surface">
        Settings
      </Text>
    </View>
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Appearance
            </Text>
            {/* Dark tokens aren't defined yet, so this persists the choice but is a
              visual no-op for now. App-load application waits on the dark theme. */}
            <View className="flex-row gap-sm">
              {THEME_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={profile.data?.theme === option.value}
                  onPress={() => {
                    setMode(option.value);
                    update.mutate({ theme: option.value });
                  }}
                />
              ))}
            </View>
          </View>

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Units
            </Text>
            <View className="flex-row gap-sm">
              {UNITS_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={profile.data?.units === option.value}
                  onPress={() => update.mutate({ units: option.value })}
                />
              ))}
            </View>
          </View>

          <View>
            <Text variant="label-caps" className="text-on-surface-variant">
              More
            </Text>
            {/* Remaining settings are Pending Definition in the PRD. */}
            <SettingRow title="Notifications" subtitle="Coming soon" />
            <SettingRow title="Privacy & data" subtitle="Coming soon" />
          </View>
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
