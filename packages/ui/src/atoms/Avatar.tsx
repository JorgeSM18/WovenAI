import { Image, type ImageProps, View } from 'react-native';

import { cn } from '../utils/cn';

export type AvatarProps = Omit<ImageProps, 'source'> & {
  uri: string;
  accessibilityLabel: string;
  className?: string;
};

// Side of the square inscribed in a circle (1/√2): an image this size, centred
// and `contain`ed, always fits entirely inside the circle — nothing is clipped.
const INSCRIBED = '71%';

/** Circular user/profile image. Size is overridable via `className`.
 *  The picture is fitted inside the circle (not filling or cropped by it). */
export function Avatar({
  uri,
  accessibilityLabel,
  className,
  resizeMode = 'contain',
  ...props
}: AvatarProps) {
  return (
    <View
      className={cn(
        'h-lg w-lg items-center justify-center overflow-hidden rounded-full bg-surface-container',
        className,
      )}
    >
      <Image
        accessible
        accessibilityLabel={accessibilityLabel}
        source={{ uri }}
        resizeMode={resizeMode}
        style={{ width: INSCRIBED, height: INSCRIBED }}
        {...props}
      />
    </View>
  );
}
