// T-0904 · Edge Function: embed a garment's text (name + category + color +
// season) with Nomic Embed Text v1.5 (768d) and store it in garment.embedding.
// Only garment *metadata* is sent to the embedding service — never the photo
// (ADR-016). The provider sits behind EMBED_URL. Runs on Supabase Edge (Deno).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const bodySchema = z.object({ garment_id: z.string().uuid() });
// The embedding service returns a single 768-float vector for the given text.
const embedSchema = z.object({ embedding: z.array(z.number()).length(768) });

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Nomic prefixes stored documents with `search_document:` (queries use
 *  `search_query:`) so both share an embedding space. */
async function embed(url: string, text: string): Promise<number[]> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: `search_document: ${text}`, task_type: 'search_document' }),
  });
  if (!res.ok) throw new Error('embed_failed');
  return embedSchema.parse(await res.json()).embedding;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_authorization' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const embedUrl = Deno.env.get('EMBED_URL');
  if (!url || !anonKey) return json({ error: 'server_misconfigured' }, 500);
  if (!embedUrl) return json({ error: 'embed_not_configured' }, 500);

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  // User-scoped client: RLS restricts the garment (and its update) to the caller.
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: garment, error } = await client
    .from('garment')
    .select('name, season, category_id, primary_color_id')
    .eq('id', body.garment_id)
    .single();
  if (error || !garment) return json({ error: 'garment_not_found' }, 404);

  const [category, color] = await Promise.all([
    client.from('category').select('name').eq('id', garment.category_id).single(),
    client.from('color').select('name').eq('id', garment.primary_color_id).single(),
  ]);

  const text = [garment.name, category.data?.name, color.data?.name, garment.season]
    .filter(Boolean)
    .join(', ');

  let vector: number[];
  try {
    vector = await embed(embedUrl, text);
  } catch {
    return json({ error: 'embed_failed' }, 502);
  }

  const { error: updateError } = await client
    .from('garment')
    .update({ embedding: `[${vector.join(',')}]` })
    .eq('id', body.garment_id);
  if (updateError) return json({ error: 'store_failed' }, 500);

  return json({ garment_id: body.garment_id }, 200);
});
