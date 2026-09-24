import { FunctionsHttpError } from '@supabase/supabase-js';
import { z } from 'zod';

const errorBodySchema = z.object({ error: z.string() });

/** Turns an Edge Function invoke error into an Error carrying the function's own
 *  error code (e.g. `remove-background: rembg_unreachable`) instead of the
 *  generic "non-2xx status code", so failures are diagnosable from the app log. */
export async function edgeError(fn: string, error: unknown): Promise<Error> {
  if (error instanceof FunctionsHttpError) {
    const response: unknown = error.context;
    if (response instanceof Response) {
      const body = errorBodySchema.safeParse(await response.json().catch(() => null));
      const code = body.success ? body.data.error : `http_${response.status}`;
      return new Error(`${fn}: ${code}`);
    }
  }
  return error instanceof Error ? error : new Error(`${fn}: ${String(error)}`);
}
