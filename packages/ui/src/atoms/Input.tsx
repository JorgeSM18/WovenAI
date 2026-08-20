import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '../utils/cn';
import { Icon } from './Icon';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  className?: string;
};

/** Single-line text input with a bottom border and optional label.
 *  Password fields (`secureTextEntry`) get a show/hide toggle automatically. */
export function Input({
  label,
  className,
  onFocus,
  onBlur,
  secureTextEntry,
  accessibilityLabel,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View className="gap-xs">
      {label ? (
        <Text variant="label-caps" className="text-on-surface-variant">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'min-h-touch-target-min flex-row items-center border-b',
          focused ? 'border-primary' : 'border-outline-variant',
        )}
      >
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          secureTextEntry={isPassword && !revealed}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            'flex-1 py-xs font-sans text-body-lg text-on-surface placeholder:text-outline',
            className,
          )}
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setRevealed((value) => !value)}
            hitSlop={8}
            className="pl-sm"
          >
            <Icon
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              className="text-on-surface-variant"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
