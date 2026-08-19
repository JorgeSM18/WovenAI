import { useDeleteAccount } from '@woven/data';
import { Button, FlowHeader, FullScreenFlowTemplate, Input, Text } from '@woven/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { authService } from '../src/auth/client';

const CONFIRM_WORD = 'ELIMINAR';

export default function DeleteAccountScreen() {
  const remove = useDeleteAccount();
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm.trim().toUpperCase() === CONFIRM_WORD && !remove.isPending;

  const onDelete = () => {
    setError(null);
    remove.mutate(undefined, {
      onSuccess: async () => {
        // The session is invalid now; clear it locally, but navigate regardless.
        try {
          await authService.signOut();
        } catch {
          // ignore — the account is already gone
        }
        router.replace('/login');
      },
      onError: () => setError('No se pudo eliminar la cuenta. Inténtalo de nuevo.'),
    });
  };

  return (
    <FullScreenFlowTemplate
      header={<FlowHeader title="Eliminar cuenta" onBack={() => router.back()} />}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          <Text variant="headline-md" className="text-on-surface">
            Esta acción es permanente
          </Text>
          <Text variant="body-lg" className="text-on-surface-variant">
            Se eliminarán para siempre tu cuenta y todos tus datos: prendas, looks, viajes, fotos y
            preferencias. No se puede deshacer.
          </Text>

          <View className="gap-sm">
            <Text variant="label-caps" className="text-on-surface-variant">
              Escribe {CONFIRM_WORD} para confirmar
            </Text>
            <Input
              label=""
              placeholder={CONFIRM_WORD}
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          {error ? (
            <Text variant="body-md" className="text-error">
              {error}
            </Text>
          ) : null}

          <Button
            label={remove.isPending ? 'Eliminando…' : 'Eliminar mi cuenta'}
            variant="danger"
            disabled={!canDelete}
            onPress={onDelete}
          />
          <Button label="Cancelar" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
