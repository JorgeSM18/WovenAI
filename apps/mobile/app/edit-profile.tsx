import { useProfile, useUpdateProfile } from '@woven/data';
import { Button, FlowHeader, FullScreenFlowTemplate, Input, Text } from '@woven/ui';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { authService } from '../src/auth/client';
import { useAuth } from '../src/providers/AuthProvider';

export default function EditProfileScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const profile = useProfile(userId);
  const update = useUpdateProfile(userId);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Prefill the username once the profile loads.
  useEffect(() => {
    if (profile.data?.displayName) setUsername(profile.data.displayName);
  }, [profile.data?.displayName]);

  const save = async () => {
    const name = username.trim();
    if (name.length === 0) {
      setError('El nombre de usuario no puede estar vacío.');
      return;
    }
    if (password.length > 0) {
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (password !== confirm) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }
    setError(null);
    setBusy(true);
    try {
      if (name !== profile.data?.displayName) {
        await update.mutateAsync({ displayName: name });
      }
      if (password.length > 0) {
        await authService.updatePassword(password);
      }
      router.back();
    } catch {
      setError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FullScreenFlowTemplate
      header={<FlowHeader title="Editar perfil" onBack={() => router.back()} />}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          <Input
            label="Nombre de usuario"
            placeholder="tu-usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Cambiar contraseña
            </Text>
            <Input
              label="Nueva contraseña"
              placeholder="Déjalo vacío para no cambiarla"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <Input
              label="Repetir contraseña"
              placeholder="Repite la nueva contraseña"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? (
            <Text variant="body-md" className="text-error">
              {error}
            </Text>
          ) : null}

          <Button
            label={busy ? 'Guardando…' : 'Guardar cambios'}
            disabled={busy}
            onPress={() => {
              void save();
            }}
          />
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
