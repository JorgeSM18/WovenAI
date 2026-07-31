import { describe, expect, it } from 'vitest';

import { assertNever } from './assertNever';

describe('assertNever', () => {
  it('throws with the unexpected value when reached at runtime', () => {
    // @ts-expect-error assertNever expects `never`; force a runtime call to
    // verify the guard throws when an unhandled value slips through.
    expect(() => assertNever('surprise')).toThrow('Unexpected value: "surprise"');
  });
});
