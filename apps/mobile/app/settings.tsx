import type { ThemePreference, UnitsPreference } from '@woven/core';
import { useProfile, useUpdateProfile } from '@woven/data';
import { Chip, FlowHeader, FullScreenFlowTemplate, SettingRow, Text, useTheme } from '@woven/ui';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

const UNITS_OPTIONS: { value: UnitsPreference; label: string }[] = [
  { value: 'metric', label: 'Métrico' },
  { value: 'imperial', label: 'Imperial' },
];

export default function SettingsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const update = useUpdateProfile(userId);
  const { setMode } = useTheme();

  return (
    <FullScreenFlowTemplate header={<FlowHeader title="Ajustes" onBack={() => router.back()} />}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Apariencia
            </Text>
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
              Unidades
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
              Más
            </Text>
            {/* Remaining settings are Pending Definition in the PRD. */}
            <SettingRow title="Notificaciones" subtitle="Próximamente" />
            <SettingRow title="Privacidad y datos" subtitle="Próximamente" />
          </View>
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
