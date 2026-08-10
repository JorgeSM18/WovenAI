import { validateTripDraft } from '@woven/core';
import { useCreateTrip } from '@woven/data';
import { Button, FullScreenFlowTemplate, IconButton, Input, Text } from '@woven/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

export default function NewTripScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const create = useCreateTrip(userId);

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onCreate = () => {
    const draft = { destination, startDate, endDate };
    const problem = validateTripDraft(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    create.mutate(draft, {
      onSuccess: () => router.back(),
      onError: () => setError('Could not create the trip. Please try again.'),
    });
  };

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
        New trip
      </Text>
    </View>
  );

  return (
    <FullScreenFlowTemplate header={header}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          <Input
            label="Destination"
            placeholder="e.g. Lisbon"
            value={destination}
            onChangeText={setDestination}
          />
          <Input
            label="Start date"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />
          <Input
            label="End date"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
          />

          {error ? (
            <Text variant="body-md" className="text-error">
              {error}
            </Text>
          ) : null}

          <Button
            label={create.isPending ? 'Creating…' : 'Create trip'}
            disabled={create.isPending}
            onPress={onCreate}
          />
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
