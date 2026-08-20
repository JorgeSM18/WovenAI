import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedScheme = 'light' | 'dark';

export type ThemeContextValue = {
  /** The user's chosen mode. */
  mode: ThemeMode;
  /** The scheme actually in effect (system resolves to light/dark). */
  scheme: ResolvedScheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  /** Initial mode (e.g. read from storage by the app). Defaults to system. */
  initialMode?: ThemeMode;
  /** Called when the mode changes, so the app can persist it. */
  onModeChange?: (mode: ThemeMode) => void;
};

/**
 * Manages the light/dark/system theme: it tracks the chosen mode and resolves
 * the effective scheme from the OS appearance.
 *
 * Applying an explicit override to NativeWind (`colorScheme.set`) is done at
 * app integration (Metro context); the light/dark token values live as CSS
 * variables in apps/mobile/global.css and swap by the effective scheme.
 */
export function ThemeProvider({
  children,
  initialMode = 'system',
  onModeChange,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [systemScheme, setSystemScheme] = useState<ResolvedScheme>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => subscription.remove();
  }, []);

  const scheme: ResolvedScheme = mode === 'system' ? systemScheme : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      setMode: (next) => {
        setModeState(next);
        onModeChange?.(next);
      },
    }),
    [mode, scheme, onModeChange],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
