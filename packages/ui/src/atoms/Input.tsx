import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '../utils/cn';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  className?: string;
};

/** Single-line text input with a bottom border and optional label. */
export function Input({ label, className, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View className="gap-xs">
      {label ? (
        <Text variant="label-caps" className="text-on-surface-variant">
          {label}
        </Text>
      ) : null}
      <TextInput
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className={cn(
          'min-h-touch-target-min border-b py-xs font-sans text-body-lg text-on-surface placeholder:text-outline',
          focused ? 'border-primary' : 'border-outline-variant',
          className,
        )}
        {...props}
      />
    </View>
  );
}
