import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon } from '../atoms/Icon';
import { IconButton } from '../atoms/IconButton';
import { Text } from '../atoms/Text';
import { cn } from '../utils/cn';

export type FlowHeaderProps = {
  title: string;
  /** Shows a back chevron when provided. */
  onBack?: () => void;
  trailing?: ReactNode;
  className?: string;
};

/** Header for full-screen flows: back chevron, title, optional trailing action. */
export function FlowHeader({ title, onBack, trailing, className }: FlowHeaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-sm border-b border-outline-variant bg-surface px-md py-sm',
        className,
      )}
    >
      {onBack ? (
        <IconButton
          icon={<Icon name="chevron-left" size={26} />}
          accessibilityLabel="Volver"
          onPress={onBack}
        />
      ) : null}
      <Text variant="title-sm" className="flex-1 text-on-surface" numberOfLines={1}>
        {title}
      </Text>
      {trailing}
    </View>
  );
}
