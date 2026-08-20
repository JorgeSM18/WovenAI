import { describe, expect, it } from 'vitest';

// The preset is the single source of truth for Woven's token *registry* and the
// spacing/type scale. Color *values* (light + dark) live in apps/mobile/global.css
// as CSS variables that the preset references. This test locks the registry and
// scale (the values disputed in the DS review, H-02) and snapshots the full set,
// so any future edit is a deliberate, reviewed change (update the snapshot).
import preset from './tailwind-preset.cjs';

const { colors, spacing, fontSize, fontFamily } = (
  preset as {
    theme: {
      extend: {
        colors: Record<string, string>;
        spacing: Record<string, string>;
        fontSize: Record<string, unknown>;
        fontFamily: Record<string, string[]>;
      };
    };
  }
).theme.extend;

describe('Woven design tokens (source of truth)', () => {
  it('locks the canonical scale/type values disputed in the review', () => {
    expect(spacing.md).toBe('32px');
    expect(spacing['touch-target-min']).toBe('44px');
    expect(fontFamily.sans[0]).toBe('HankenGrotesk_400Regular');
  });

  it('wires every color token to its themeable CSS variable', () => {
    // Each role must resolve to its var so light/dark swaps happen token-level.
    expect(colors.primary).toBe('rgb(var(--color-primary) / <alpha-value>)');
    expect(colors.surface).toBe('rgb(var(--color-surface) / <alpha-value>)');
    expect(colors.tertiary).toBe('rgb(var(--color-tertiary) / <alpha-value>)');
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^rgb\(var\(--color-[a-z-]+\) \/ <alpha-value>\)$/);
    }
  });

  it('snapshots the full token registry so drift is caught in CI', () => {
    expect({ colorTokens: Object.keys(colors).sort(), spacing, fontSize }).toMatchSnapshot();
  });
});
