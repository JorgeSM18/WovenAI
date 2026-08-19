// Edge Function: permanently delete the caller's account and all their data.
// The client cannot do this (needs service_role). Deleting the auth user
// cascades to public.profile and, from there, to every user-owned table
// (garment, outfit, trip, collections, prefs, image_asset…) via ON DELETE
// CASCADE. Storage objects aren't covered by DB cascade, so we best-effort
// remove the user's files first. Runs on Supabase Edge (Deno).
import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'images';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Best-effort removal of every object under `<userId>/…` in the images bucket. */
async function purgeStorage(admin: ReturnType<typeof createClient>, userId: string): Promise<void> {
  const bucket = admin.storage.from(BUCKET);
  const { data: folders } = await bucket.list(userId);
  const paths: string[] = [];
  for (const folder of folders ?? []) {
    const { data: files } = await bucket.list(`${userId}/${folder.name}`);
    for (const file of files ?? []) paths.push(`${userId}/${folder.name}/${file.name}`);
  }
  if (paths.length > 0) await bucket.remove(paths);
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

  // Identify the caller from their JWT — a user can only delete their own account.
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401);
  const userId = userData.user.id;

  const admin = createClient(url, serviceKey);

  // Files are inaccessible once the account is gone, so a purge failure is
  // non-fatal — we still delete the account.
  try {
    await purgeStorage(admin, userId);
  } catch (_) {
    // ignore — proceed with account deletion
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return json({ error: 'delete_failed' }, 500);

  return json({ ok: true }, 200);
});
