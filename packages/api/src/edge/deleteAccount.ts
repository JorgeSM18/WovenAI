import { z } from 'zod';

import type { WovenClient } from '../client';

const deleteAccountResultSchema = z.object({ ok: z.literal(true) });

/** Permanently deletes the caller's account and all their data via the
 *  `delete-account` Edge Function (service_role; cascades from auth.users). */
export async function deleteAccount(client: WovenClient): Promise<void> {
  const { data, error } = await client.functions.invoke('delete-account', { body: {} });
  if (error) throw error;
  deleteAccountResultSchema.parse(data);
}
