import type { Database, WovenClient } from '@woven/api';
import type { StylePreference } from '@woven/core';

type StylePreferenceRow = Database['public']['Tables']['style_preference']['Row'];

export function rowToStylePreference(row: Pick<StylePreferenceRow, 'id' | 'tag'>): StylePreference {
  return { id: row.id, tag: row.tag };
}

export async function listStylePreferences(client: WovenClient): Promise<StylePreference[]> {
  const { data, error } = await client
    .from('style_preference')
    .select('id, tag')
    .order('tag', { ascending: true });
  if (error) throw error;
  return data.map(rowToStylePreference);
}

export async function addStylePreference(
  client: WovenClient,
  userId: string,
  tag: string,
): Promise<StylePreference> {
  const { data, error } = await client
    .from('style_preference')
    .insert({ user_id: userId, tag })
    .select('id, tag')
    .single();
  if (error) throw error;
  return rowToStylePreference(data);
}

export async function removeStylePreference(client: WovenClient, id: string): Promise<void> {
  const { error } = await client.from('style_preference').delete().eq('id', id);
  if (error) throw error;
}
