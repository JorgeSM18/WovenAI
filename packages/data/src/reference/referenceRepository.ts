import type { WovenClient } from '@woven/api';
import type { Category, Color } from '@woven/core';

export async function listCategories(client: WovenClient): Promise<Category[]> {
  const { data, error } = await client
    .from('category')
    .select('id, name')
    .order('sort', { ascending: true });
  if (error) throw error;
  return data;
}

export async function listColors(client: WovenClient): Promise<Color[]> {
  const { data, error } = await client
    .from('color')
    .select('id, name, hex')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}
