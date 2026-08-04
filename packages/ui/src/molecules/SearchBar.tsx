import { TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type SearchBarProps = TextInputProps & {
  className?: string;
};

/** Search field with a leading glyph. */
export function SearchBar({ className, placeholder, ...props }: SearchBarProps) {
  return (
    <View
      className={cn(
        'min-h-touch-target-min flex-row items-center gap-sm rounded-lg bg-surface-container-lowest px-md',
        className,
      )}
    >
      <Text variant="body-lg" className="text-outline" accessibilityElementsHidden>
        ⌕
      </Text>
      <TextInput
        accessibilityLabel="Search"
        placeholder={placeholder ?? 'Search'}
        className="flex-1 font-sans text-body-lg text-on-surface placeholder:text-outline"
        {...props}
      />
    </View>
  );
}
