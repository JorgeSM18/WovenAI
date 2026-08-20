// T-0902 · Edge Function: remove a garment photo's background via a self-hosted
// rembg service (REMBG_URL), then store the transparent PNG as a `processed`
// image_asset. The original bytes only ever reach YOUR own service — never an
// external AI provider (ADR-016 privacy rule). Runs on Supabase Edge (Deno).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const BUCKET = 'images';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const bodySchema = z.object({ image_asset_id: z.string().uuid() });

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** `images/<key>` (stored) → `<key>` (Storage API key). */
function stripBucket(storagePath: string): string {
  return storagePath.startsWith(`${BUCKET}/`) ? storagePath.slice(BUCKET.length + 1) : storagePath;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_authorization' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const rembgUrl = Deno.env.get('REMBG_URL');
  if (!url || !anonKey || !serviceKey) return json({ error: 'server_misconfigured' }, 500);
  if (!rembgUrl) return json({ error: 'rembg_not_configured' }, 500);

  // Identify the caller from their JWT.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401);
  const userId = userData.user.id;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  // Ownership: RLS returns the asset only if the caller owns it.
  const { data: asset, error: assetError } = await userClient
    .from('image_asset')
    .select('storage_path, mime, width, height')
    .eq('id', body.image_asset_id)
    .single();
  if (assetError || !asset) return json({ error: 'image_not_found' }, 404);

  const admin = createClient(url, serviceKey);

  // Download the original bytes (service_role; path already proven to be the caller's).
  const { data: original, error: downloadError } = await admin.storage
    .from(BUCKET)
    .download(stripBucket(asset.storage_path));
  if (downloadError || !original) return json({ error: 'download_failed' }, 502);

  // Send to the self-hosted rembg service (stock `rembg s` exposes /api/remove
  // accepting a multipart `file` and returning image/png). A failure never
  // blocks the user — the caller falls back to the original image.
  let png: Uint8Array;
  try {
    const form = new FormData();
    form.append(
      'file',
      new Blob([await original.arrayBuffer()], { type: asset.mime ?? undefined }),
    );
    const res = await fetch(rembgUrl, { method: 'POST', body: form });
    if (!res.ok) return json({ error: 'rembg_failed' }, 502);
    png = new Uint8Array(await res.arrayBuffer());
  } catch {
    return json({ error: 'rembg_unreachable' }, 502);
  }

  // Store the transparent PNG as a new `processed` asset, scoped to the user.
  const path = `${userId}/processed/${crypto.randomUUID()}.png`;
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, png, { contentType: 'image/png' });
  if (uploadError) return json({ error: 'upload_failed' }, 502);

  const { data: inserted, error: insertError } = await admin
    .from('image_asset')
    .insert({
      user_id: userId,
      storage_path: `${BUCKET}/${path}`,
      type: 'processed',
      width: asset.width,
      height: asset.height,
      mime: 'image/png',
      bytes: png.byteLength,
    })
    .select('id')
    .single();
  if (insertError || !inserted) return json({ error: 'record_failed' }, 500);

  return json({ processed_image_id: inserted.id }, 200);
});
