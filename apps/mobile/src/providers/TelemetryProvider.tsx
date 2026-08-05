import { createTelemetry, type Telemetry } from '@woven/analytics';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

const TelemetryContext = createContext<Telemetry | null>(null);

/** Provides the telemetry instance (no-op until real providers are wired). */
export function TelemetryProvider({ children }: { children: ReactNode }) {
  const telemetry = useMemo(() => createTelemetry(), []);
  return <TelemetryContext.Provider value={telemetry}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry(): Telemetry {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
