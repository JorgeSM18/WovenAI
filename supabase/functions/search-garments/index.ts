// T-0904 · Edge Function: semantic wardrobe search. Embeds the query text with
// Nomic Embed Text v1.5 (768d) and ranks the caller's garments by cosine
// similarity via the `search_garments` RPC (RLS-scoped). Runs on Supabase Edge.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const bodySchema = z.object({
  query: z.string().min(1),
  match_count: z.number().int().positive().max(50).optional(),
});
const embedSchema = z.object({ embedding: z.array(z.number()).length(768) });

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

  // Embed the query (search_query prefix shares Nomic's space with stored docs).
  let vector: number[];
  try {
    const res = await fetch(embedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: `search_query: ${body.query}`, task_type: 'search_query' }),
    });
    if (!res.ok) return json({ error: 'embed_failed' }, 502);
    vector = embedSchema.parse(await res.json()).embedding;
  } catch {
    return json({ error: 'embed_failed' }, 502);
  }

  // RLS applies through the RPC (security invoker) — only the caller's garments.
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.rpc('search_garments', {
    query_embedding: `[${vector.join(',')}]`,
    match_count: body.match_count ?? 20,
  });
  if (error) return json({ error: 'search_failed' }, 500);

  return json({ results: data ?? [] }, 200);
});
