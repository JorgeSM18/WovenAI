/** A product analytics event. */
export type TelemetryEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

/**
 * Cross-cutting telemetry contract (analytics + crash reporting).
 *
 * Implementations are provider-agnostic: the app depends on this interface,
 * never on a concrete provider (Sentry/PostHog). Real adapters are wired in a
 * later roadmap phase; until then `noopTelemetry` is used.
 */
export interface Telemetry {
  /** Associate subsequent events/errors with a user. */
  identify(userId: string, traits?: Record<string, unknown>): void;
  /** Record a product analytics event. */
  track(event: TelemetryEvent): void;
  /** Report an error/exception with optional context. */
  captureError(error: unknown, context?: Record<string, unknown>): void;
  /** Clear the current identity (e.g. on log out). */
  reset(): void;
}
