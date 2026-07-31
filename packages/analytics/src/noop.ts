import type { Telemetry } from './telemetry';

/**
 * No-op telemetry: the default implementation used in development and
 * whenever no provider is configured. Does nothing and never throws.
 */
export const noopTelemetry: Telemetry = {
  identify: () => {},
  track: () => {},
  captureError: () => {},
  reset: () => {},
};
