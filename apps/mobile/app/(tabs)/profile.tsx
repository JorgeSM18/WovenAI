import { Button, SettingRow, Skeleton, StatCard, TabScreenTemplate, Text } from '@woven/ui';
import { useGarmentCount, useProfile } from '@woven/data';
import { router } from 'expo-router';
import { View } from 'react-native';

import { authService } from '../../src/auth/client';
import { StylePreferences } from '../../src/features/profile/StylePreferences';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ProfileScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const garmentCount = useGarmentCount(userId);

  return (
    <TabScreenTemplate>
      <Text variant="display-lg" className="text-on-surface">
        Profile
      </Text>

      {/* Header: name + email. Avatar image waits on Storage/signed URLs (T-0205). */}
      {profile.isPending ? (
        <View className="gap-xs">
          <Skeleton className="h-lg w-2/3" />
          <Skeleton className="h-md w-1/2" />
        </View>
      ) : profile.isError ? (
        <Text variant="body-md" className="text-error">
          We couldn&apos;t load your profile. Pull to retry.
        </Text>
      ) : (
        <View className="gap-xs">
          <Text variant="headline-md" className="text-on-surface">
            {profile.data.displayName ?? 'Your profile'}
          </Text>
          {profile.data.email ? (
            <Text variant="body-md" className="text-on-surface-variant">
              {profile.data.email}
            </Text>
          ) : null}
        </View>
      )}

      <StatCard
        label="Total Items"
        value={garmentCount.isSuccess ? String(garmentCount.data) : '—'}
      />

      {/* Cost / Sustainability / Style analytics are hidden until defined
          (PD-07 / PD-08 / PD-12). Do not render placeholders for them. */}

      {userId ? <StylePreferences userId={userId} /> : null}

      <SettingRow title="Settings" onPress={() => router.push('/settings')} />

      <Button
        label="Log Out"
        variant="secondary"
        onPress={() => {
          void authService.signOut();
        }}
      />
    </TabScreenTemplate>
  );
}
