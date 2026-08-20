import { TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '../atoms/Icon';
import { cn } from '../utils/cn';

export type SearchBarProps = TextInputProps & {
  className?: string;
};

/** Search field with a leading icon. */
export function SearchBar({ className, placeholder, ...props }: SearchBarProps) {
  return (
    <View
      className={cn(
        'min-h-touch-target-min flex-row items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest px-md',
        className,
      )}
    >
      <Icon name="magnify" size={20} className="text-outline" />
      <TextInput
        accessibilityLabel="Buscar"
        placeholder={placeholder ?? 'Buscar'}
        className="flex-1 font-sans text-body-lg text-on-surface placeholder:text-outline"
        {...props}
      />
    </View>
  );
}
