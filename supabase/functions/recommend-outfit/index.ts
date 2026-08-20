// T-0704 · Edge Function: score how well a set of garments work together as an
// outfit, with Gemini (text → JSON). Only garment *metadata* is sent — never
// photos (ADR-016). On any failure it returns a null score so the UI simply
// hides it; never blocks. Requires GEMINI_KEY in Supabase secrets. Deno.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const MODEL = 'gemini-2.0-flash';
const PROMPT_VERSION = 'recommend-v1';
const PROMPT =
  'You are a fashion stylist. Given these garments a user is combining into one ' +
  'outfit, judge how well they work together. Return JSON with: matchScore ' +
  '(integer 0-100, overall cohesion), suggestions (0-3 short tips to improve or ' +
  'complete the look), conflicts (0-3 short notes on clashes in color, formality, ' +
  'season or texture; empty array if none).';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const bodySchema = z.object({ garment_ids: z.array(z.string().uuid()).min(2).max(12) });

const geminiSchema = z.object({
  matchScore: z.number(),
  suggestions: z.array(z.string()),
  conflicts: z.array(z.string()),
});

const UNAVAILABLE = { matchScore: null, suggestions: [], conflicts: [] };

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_authorization' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const geminiKey = Deno.env.get('GEMINI_KEY');
  if (!url || !anonKey) return json({ error: 'server_misconfigured' }, 500);
  if (!geminiKey) return json(UNAVAILABLE, 200); // no key → hide the score

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    // RLS scopes these to the caller's own garments.
    const { data: garments, error } = await client
      .from('garment')
      .select('id, name, season, category_id, primary_color_id')
      .in('id', body.garment_ids);
    if (error || !garments || garments.length < 2) return json(UNAVAILABLE, 200);

    const categoryIds = [...new Set(garments.map((g) => g.category_id))];
    const colorIds = [...new Set(garments.map((g) => g.primary_color_id))];
    const [categories, colors] = await Promise.all([
      client.from('category').select('id, name').in('id', categoryIds),
      client.from('color').select('id, name').in('id', colorIds),
    ]);
    const categoryName = new Map((categories.data ?? []).map((c) => [c.id, c.name]));
    const colorName = new Map((colors.data ?? []).map((c) => [c.id, c.name]));

    const list = garments
      .map((g) =>
        [
          `- ${g.name}`,
          categoryName.get(g.category_id),
          colorName.get(g.primary_color_id),
          g.season,
        ]
          .filter(Boolean)
          .join(' · '),
      )
      .join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${PROMPT}\n\nGarments:\n${list}` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    if (!response.ok) return json(UNAVAILABLE, 200);
    const payload = await response.json();

    // Cost instrumentation (§ AI): token usage per call.
    console.log('recommend-outfit', PROMPT_VERSION, JSON.stringify(payload.usageMetadata ?? {}));

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') return json(UNAVAILABLE, 200);

    const parsed = geminiSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return json(UNAVAILABLE, 200);

    return json(
      {
        matchScore: clamp(parsed.data.matchScore),
        suggestions: parsed.data.suggestions.slice(0, 3),
        conflicts: parsed.data.conflicts.slice(0, 3),
      },
      200,
    );
  } catch {
    return json(UNAVAILABLE, 200);
  }
});
