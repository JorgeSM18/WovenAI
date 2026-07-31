import { Image, type ImageProps } from 'react-native';

import { cn } from '../utils/cn';

export type AvatarProps = Omit<ImageProps, 'source'> & {
  uri: string;
  accessibilityLabel: string;
  className?: string;
};

/** Circular user/profile image. Size is overridable via `className`. */
export function Avatar({ uri, accessibilityLabel, className, ...props }: AvatarProps) {
  return (
    <Image
      accessible
      accessibilityLabel={accessibilityLabel}
      source={{ uri }}
      className={cn('h-lg w-lg rounded-full bg-surface-container', className)}
      {...props}
    />
  );
}
