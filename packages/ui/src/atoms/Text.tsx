import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '../utils/cn';

const VARIANT_CLASS = {
  'display-lg': 'text-display-lg',
  'headline-md': 'text-headline-md',
  'title-sm': 'text-title-sm',
  'body-lg': 'text-body-lg',
  'body-md': 'text-body-md',
  'label-caps': 'text-label-caps uppercase',
} as const;

export type TextVariant = keyof typeof VARIANT_CLASS;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  className?: string;
};

/** Typographic primitive. Renders Hanken Grotesk with a token-based scale. */
export function Text({ variant = 'body-md', className, ...props }: TextProps) {
  return (
    <RNText
      className={cn('font-sans text-on-surface', VARIANT_CLASS[variant], className)}
      {...props}
    />
  );
}
