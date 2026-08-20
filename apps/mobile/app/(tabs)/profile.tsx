import { generateUsername } from '@woven/core';
import {
  useAvatarUrl,
  useGarmentCount,
  useProfile,
  useUpdateProfile,
  useUploadImage,
} from '@woven/data';
import {
  AppHeader,
  Avatar,
  Button,
  Icon,
  SettingRow,
  Skeleton,
  StatCard,
  TabScreenTemplate,
  Text,
} from '@woven/ui';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';

import { authService } from '../../src/auth/client';
import { processForUpload } from '../../src/features/capture/processImage';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ProfileScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const garmentCount = useGarmentCount(userId);
  const update = useUpdateProfile(userId);
  const upload = useUploadImage();
  const avatar = useAvatarUrl(profile.data?.avatarAssetId ?? null);

  // Give new accounts a random, changeable username when none is set yet (once).
  const seededUsername = useRef(false);
  useEffect(() => {
    if (!seededUsername.current && profile.isSuccess && !profile.data.displayName) {
      seededUsername.current = true;
      update.mutate({ displayName: generateUsername() });
    }
  }, [profile.isSuccess, profile.data, update]);

  const pickAvatar = async () => {
    if (!userId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    const processed = await processForUpload({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    });
    const uploaded = await upload.mutateAsync({
      userId,
      uri: processed.uri,
      type: 'avatar',
      mime: processed.mime,
      width: processed.width,
      height: processed.height,
    });
    update.mutate({ avatarAssetId: uploaded.id });
  };

  const uploading = upload.isPending;

  return (
    <TabScreenTemplate header={<AppHeader />}>
      {/* Identity */}
      <View className="items-center gap-sm pt-sm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cambiar avatar"
          onPress={() => {
            void pickAvatar();
          }}
          className={`h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surface-container ${
            uploading ? 'opacity-50' : ''
          }`}
        >
          {avatar.data ? (
            <Avatar uri={avatar.data} accessibilityLabel="Tu avatar" className="h-24 w-24" />
          ) : (
            <Icon name="account" size={44} className="text-outline" />
          )}
        </Pressable>

        {profile.isPending ? (
          <View className="items-center gap-xs">
            <Skeleton className="h-lg w-40" />
          </View>
        ) : profile.isError ? (
          <Text variant="body-md" className="text-error">
            No pudimos cargar tu perfil. Desliza para reintentar.
          </Text>
        ) : (
          <Text variant="headline-md" className="text-on-surface">
            {profile.data.displayName ?? '—'}
          </Text>
        )}

        <Button
          label="Editar perfil"
          variant="secondary"
          onPress={() => router.push('/edit-profile')}
        />
      </View>

      <StatCard
        label="Prendas totales"
        value={garmentCount.isSuccess ? String(garmentCount.data) : '—'}
      />

      {/* App settings */}
      <View className="gap-xs">
        <Text variant="label-caps" className="text-on-surface-variant">
          Cuenta
        </Text>
        <SettingRow
          title="Ajustes"
          subtitle="Apariencia, unidades e idioma"
          onPress={() => router.push('/settings')}
        />
      </View>

      <Button
        label="Cerrar sesión"
        variant="secondary"
        onPress={() => {
          void authService.signOut();
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Eliminar cuenta"
        onPress={() => router.push('/delete-account')}
        className="min-h-touch-target-min items-center justify-center"
      >
        <Text variant="label-caps" className="text-error">
          Eliminar cuenta
        </Text>
      </Pressable>
    </TabScreenTemplate>
  );
}
