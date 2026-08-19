import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '../utils/cn';

// Weight is carried by the font family (hk-*) because RN/Android selects fonts
// by exact family name, not numeric fontWeight. `font-sans` is regular (400).
const VARIANT_CLASS = {
  'display-lg': 'text-display-lg font-hk-light',
  'display-md': 'text-display-md font-hk-light',
  'headline-lg': 'text-headline-lg font-sans',
  'headline-lg-mobile': 'text-headline-lg-mobile font-sans',
  'headline-md': 'text-headline-md font-hk-medium',
  'title-sm': 'text-title-sm font-hk-semibold',
  'body-lg': 'text-body-lg font-sans',
  'body-md': 'text-body-md font-sans',
  'label-caps': 'text-label-caps font-hk-semibold uppercase',
  'label-sm': 'text-label-sm font-hk-medium',
} as const;

export type TextVariant = keyof typeof VARIANT_CLASS;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

// True when className already sets a text color (a token role), so we don't add
// the default on-surface and let plain `cn` join produce two competing colors.
const COLOR_RE = /(^|\s)text-(on-|primary|secondary|tertiary|error|outline|inverse|surface|background)/;

/** Typographic primitive. Renders Hanken Grotesk with a token-based scale. */
export function Text({ variant = 'body-md', className, ...props }: TextProps) {
  const hasColor = className ? COLOR_RE.test(className) : false;
  return (
    <RNText
      className={cn(VARIANT_CLASS[variant], !hasColor && 'text-on-surface', className)}
      {...props}
    />
  );
}
