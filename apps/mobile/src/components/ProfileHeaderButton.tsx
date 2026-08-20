import { useAvatarUrl, useProfile } from '@woven/data';
import { Avatar, Icon } from '@woven/ui';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { useAuth } from '../providers/AuthProvider';

/**
 * Header avatar button shared by the tab screens. Shows the user's real avatar
 * when available (falling back to an account icon) and opens the Profile tab.
 * Lives in the app (not packages/ui) because it reads data hooks.
 */
export function ProfileHeaderButton() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const avatar = useAvatarUrl(profile.data?.avatarAssetId ?? null);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Perfil"
      onPress={() => router.push('/profile')}
      className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-container active:opacity-70"
    >
      {avatar.data ? (
        <Avatar uri={avatar.data} accessibilityLabel="Tu avatar" className="h-9 w-9" />
      ) : (
        <Icon name="account" size={20} className="text-outline" />
      )}
    </Pressable>
  );
}
