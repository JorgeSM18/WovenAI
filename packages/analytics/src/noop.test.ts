import { describe, expect, it } from 'vitest';

import { createTelemetry, noopTelemetry } from './index';

describe('telemetry', () => {
  it('noop implementation performs every operation without throwing', () => {
    expect(() => {
      noopTelemetry.identify('user-1', { plan: 'free' });
      noopTelemetry.track({ name: 'test_event', properties: { a: 1 } });
      noopTelemetry.captureError(new Error('boom'), { where: 'test' });
      noopTelemetry.reset();
    }).not.toThrow();
  });

  it('createTelemetry returns a usable Telemetry instance', () => {
    const telemetry = createTelemetry();
    expect(() => telemetry.track({ name: 'created' })).not.toThrow();
  });
});
