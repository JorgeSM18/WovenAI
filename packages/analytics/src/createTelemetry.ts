import { noopTelemetry } from './noop';
import type { Telemetry } from './telemetry';

/**
 * Returns the active Telemetry implementation.
 *
 * For now it always returns the no-op implementation: the Sentry (crash) and
 * PostHog (product analytics) adapters are intentionally deferred to a later
 * roadmap phase, mirroring the interface-first approach used for AI services.
 * When wired, this factory selects the real implementation in production and
 * the no-op one in development.
 */
export function createTelemetry(): Telemetry {
  return noopTelemetry;
}
