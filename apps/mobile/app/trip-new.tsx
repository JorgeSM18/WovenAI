import { validateTripDraft } from '@woven/core';
import { useCreateTrip } from '@woven/data';
import { Button, FlowHeader, FullScreenFlowTemplate, Input, Text } from '@woven/ui';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useAuth } from '../src/providers/AuthProvider';

type Field = 'start' | 'end';

function DateField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <View className="gap-xs">
      <Text variant="label-caps" className="text-on-surface-variant">
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'sin definir'}`}
        onPress={onPress}
        className="min-h-touch-target-min justify-center border-b border-outline-variant py-xs"
      >
        <Text variant="body-lg" className={value ? 'text-on-surface' : 'text-outline'}>
          {value || 'AAAA-MM-DD'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function NewTripScreen() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const create = useCreateTrip(userId);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [picker, setPicker] = useState<Field | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickerValue = (() => {
    const current = picker === 'start' ? startDate : endDate;
    return current ? new Date(`${current}T00:00:00Z`) : new Date();
  })();

  const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    const field = picker;
    setPicker(null);
    if (event.type !== 'set' || !date || !field) return;
    const iso = date.toISOString().slice(0, 10);
    if (field === 'start') setStartDate(iso);
    else setEndDate(iso);
  };

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
      onError: () => setError('No se pudo crear el viaje. Inténtalo de nuevo.'),
    });
  };

  return (
    <FullScreenFlowTemplate
      header={<FlowHeader title="Nuevo viaje" onBack={() => router.back()} />}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-lg p-md">
          <Input
            label="Destino"
            placeholder="p. ej. Lisboa"
            value={destination}
            onChangeText={setDestination}
          />
          <DateField label="Fecha de inicio" value={startDate} onPress={() => setPicker('start')} />
          <DateField label="Fecha de fin" value={endDate} onPress={() => setPicker('end')} />

          {picker ? (
            <DateTimePicker value={pickerValue} mode="date" onChange={onPickerChange} />
          ) : null}

          {error ? (
            <Text variant="body-md" className="text-error">
              {error}
            </Text>
          ) : null}

          <Button
            label={create.isPending ? 'Creando…' : 'Crear viaje'}
            disabled={create.isPending}
            onPress={onCreate}
          />
        </View>
      </ScrollView>
    </FullScreenFlowTemplate>
  );
}
