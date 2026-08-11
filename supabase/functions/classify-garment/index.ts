// T-0903 · Edge Function: classify a garment photo with Gemini (vision → JSON).
// Output is validated; on any failure it returns an empty, zero-confidence
// suggestion so the user can always fill the fields manually (never blocks).
// Requires GEMINI_KEY in Supabase secrets. Runs on Supabase Edge (Deno).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';
import { encodeBase64 } from 'jsr:@std/encoding@1/base64';

const BUCKET = 'images';
const MODEL = 'gemini-2.0-flash';
const PROMPT_VERSION = 'classify-v1';
const PROMPT =
  'You are a fashion cataloguer. Look at this single garment photo and return JSON with: ' +
  'category (one of: Tops, Bottoms, Outerwear, Dresses, Footwear, Bags, Accessories), ' +
  'color (a common color name, e.g. Black, Navy, Beige), ' +
  'season (one of: spring, summer, fall, winter, or null if unclear), ' +
  'style (0-3 short style tags), and confidence (0..1). Use null when unsure.';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const bodySchema = z.object({ image_asset_id: z.string().uuid() });

const geminiSchema = z.object({
  category: z.string().nullable(),
  color: z.string().nullable(),
  season: z.string().nullable(),
  style: z.array(z.string()),
  confidence: z.number(),
});

const SEASONS = ['spring', 'summer', 'fall', 'winter'];

const EMPTY = { categoryName: null, colorName: null, season: null, style: [], confidence: 0 };

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function stripBucket(path: string): string {
  return path.startsWith(`${BUCKET}/`) ? path.slice(BUCKET.length + 1) : path;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_authorization' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const geminiKey = Deno.env.get('GEMINI_KEY');
  if (!url || !anonKey) return json({ error: 'server_misconfigured' }, 500);
  // No key configured → graceful empty suggestion (manual entry still works).
  if (!geminiKey) return json(EMPTY, 200);

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
    const { data: asset, error } = await client
      .from('image_asset')
      .select('storage_path, mime')
      .eq('id', body.image_asset_id)
      .single();
    if (error || !asset) return json(EMPTY, 200);

    const { data: blob, error: dlError } = await client.storage
      .from(BUCKET)
      .download(stripBucket(asset.storage_path));
    if (dlError || !blob) return json(EMPTY, 200);
    const base64 = encodeBase64(await blob.arrayBuffer());

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: asset.mime ?? 'image/jpeg', data: base64 } },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    );
    if (!response.ok) return json(EMPTY, 200);
    const payload = await response.json();

    // Cost instrumentation (§ AI): token usage per call.
    console.log('classify-garment', PROMPT_VERSION, JSON.stringify(payload.usageMetadata ?? {}));

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') return json(EMPTY, 200);

    const parsed = geminiSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return json(EMPTY, 200);
    const c = parsed.data;

    return json(
      {
        categoryName: c.category,
        colorName: c.color,
        season: c.season && SEASONS.includes(c.season) ? c.season : null,
        style: c.style,
        confidence: c.confidence,
      },
      200,
    );
  } catch {
    return json(EMPTY, 200);
  }
});
