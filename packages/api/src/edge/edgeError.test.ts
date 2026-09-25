import { FunctionsHttpError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { edgeError } from './edgeError';

const httpError = (body: string, status: number) =>
  new FunctionsHttpError(new Response(body, { status }));

describe('edgeError', () => {
  it("surfaces the function's error code", async () => {
    const err = await edgeError(
      'remove-background',
      httpError('{"error":"rembg_unreachable"}', 502),
    );
    expect(err.message).toBe('remove-background: rembg_unreachable');
  });

  it('falls back to the HTTP status when the body has no code', async () => {
    const err = await edgeError('classify-garment', httpError('oops', 500));
    expect(err.message).toBe('classify-garment: http_500');
  });

  it('passes other errors through', async () => {
    const original = new Error('network down');
    expect(await edgeError('x', original)).toBe(original);
  });
});
