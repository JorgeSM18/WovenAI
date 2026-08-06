import type { WovenClient } from '@woven/api';

/** Number of the user's active (non-deleted) garments. RLS scopes to the caller. */
export async function countGarments(client: WovenClient): Promise<number> {
  const { count, error } = await client
    .from('garment')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);
  if (error) throw error;
  return count ?? 0;
}
