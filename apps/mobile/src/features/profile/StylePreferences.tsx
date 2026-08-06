import { useAddStylePreference, useRemoveStylePreference, useStylePreferences } from '@woven/data';
import { Button, Chip, Input, Text } from '@woven/ui';
import { useState } from 'react';
import { View } from 'react-native';

/** Add/remove free-form style tags. Tapping a chip removes it. */
export function StylePreferences({ userId }: { userId: string }) {
  const prefs = useStylePreferences(userId);
  const add = useAddStylePreference(userId);
  const remove = useRemoveStylePreference(userId);
  const [tag, setTag] = useState('');

  const submit = () => {
    const value = tag.trim();
    if (value.length === 0) return;
    add.mutate(value);
    setTag('');
  };

  return (
    <View className="gap-sm">
      <Text variant="title-sm" className="text-on-surface">
        Style Preferences
      </Text>

      {prefs.data && prefs.data.length > 0 ? (
        <View className="flex-row flex-wrap gap-sm">
          {prefs.data.map((pref) => (
            <Chip
              key={pref.id}
              label={`${pref.tag}  ✕`}
              accessibilityLabel={`Remove ${pref.tag}`}
              onPress={() => remove.mutate(pref.id)}
            />
          ))}
        </View>
      ) : prefs.isPending ? (
        <Text variant="body-md" className="text-on-surface-variant">
          Loading…
        </Text>
      ) : (
        <Text variant="body-md" className="text-on-surface-variant">
          No styles yet. Add one below.
        </Text>
      )}

      <View className="flex-row items-end gap-sm">
        <View className="flex-1">
          <Input
            label="Add a style"
            placeholder="e.g. minimalist"
            value={tag}
            onChangeText={setTag}
            onSubmitEditing={submit}
            returnKeyType="done"
            autoCapitalize="none"
          />
        </View>
        <Button label="Add" onPress={submit} disabled={tag.trim().length === 0} />
      </View>
    </View>
  );
}
