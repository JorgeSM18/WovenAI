// T-0205 · Edge Function: mint a signed upload URL for the caller's own folder.
// Input: { type, mime }. Output: { bucket, path, token, signedUrl }.
// The path is always scoped to the authenticated user's id, so storage RLS and
// this function agree on ownership. Runs on Supabase Edge (Deno).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const BUCKET = 'images';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const bodySchema = z.object({
  type: z.enum(['original', 'processed', 'avatar', 'outfit_cover']),
  mime: z.enum(['image/jpeg', 'image/webp', 'image/png']),
});

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/png': 'png',
};

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
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anonKey || !serviceKey) return json({ error: 'server_misconfigured' }, 500);

  // Identify the caller from their JWT.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401);

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  const path = `${userData.user.id}/${body.type}/${crypto.randomUUID()}.${EXT[body.mime]}`;

  // service_role mints the signed URL; the path is already scoped to the user.
  const admin = createClient(url, serviceKey);
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return json({ error: 'sign_failed' }, 500);

  return json({ bucket: BUCKET, path, token: data.token, signedUrl: data.signedUrl }, 200);
});
