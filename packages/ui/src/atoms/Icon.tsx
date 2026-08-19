import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cssInterop } from 'nativewind';
import type { ComponentType } from 'react';

/** Valid Material Community Icons glyph names. */
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Icon fonts read the `color` prop, not `style.color`. Compile `className` to a
// style and hand the resolved color to the `color` prop so token classes
// (text-primary, text-on-primary, …) actually tint the glyph.
cssInterop(MaterialCommunityIcons, {
  className: { target: 'style', nativeStyleToProp: { color: true } },
});

const TokenIcon = MaterialCommunityIcons as ComponentType<{
  name: IconName;
  size?: number;
  className?: string;
}>;

export type IconProps = {
  name: IconName;
  /** Glyph size in px. */
  size?: number;
  /** Token color class, e.g. `text-primary`. Defaults to on-surface. */
  className?: string;
};

/** Vector icon primitive (Material Community Icons) tinted via tokens.
 *  Decorative by default — the pressable parent carries the accessible label. */
export function Icon({ name, size = 24, className }: IconProps) {
  return <TokenIcon name={name} size={size} className={className ?? 'text-on-surface'} />;
}
