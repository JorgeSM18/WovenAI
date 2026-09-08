import { Image, type ImageProps } from 'react-native';

import { cn } from '../utils/cn';

export type AvatarProps = Omit<ImageProps, 'source'> & {
  uri: string;
  accessibilityLabel: string;
  className?: string;
};

/** Circular user/profile image. Size is overridable via `className`.
 *  Defaults to `contain` so the whole picture shows without being cropped by the
 *  circle (override with `resizeMode` if a filled look is wanted). */
export function Avatar({
  uri,
  accessibilityLabel,
  className,
  resizeMode = 'contain',
  ...props
}: AvatarProps) {
  return (
    <Image
      accessible
      accessibilityLabel={accessibilityLabel}
      source={{ uri }}
      resizeMode={resizeMode}
      className={cn('h-lg w-lg rounded-full bg-surface-container', className)}
      {...props}
    />
  );
}
