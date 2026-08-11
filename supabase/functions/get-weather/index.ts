// T-0801 · Edge Function: weather for a trip's days (Open-Meteo, keyless).
// Geocodes the trip destination, fetches the daily forecast for the date range,
// and caches it in weather_snapshot (fresh for 3h). Runs on Supabase Edge (Deno).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const CACHE_TTL_MS = 3 * 60 * 60 * 1000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const bodySchema = z.object({ trip_id: z.string().uuid() });

// WMO weather codes → short condition text.
const CONDITIONS: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Showers',
  81: 'Showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

type Snapshot = { date: string; temp_c: number | null; condition: string | null; location: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_authorization' }, 401);

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anonKey) return json({ error: 'server_misconfigured' }, 500);

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  // User-scoped client: RLS restricts the trip + weather_snapshot to the caller.
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: trip, error: tripError } = await client
    .from('trip')
    .select('destination, start_date, end_date')
    .eq('id', body.trip_id)
    .single();
  if (tripError || !trip) return json({ error: 'trip_not_found' }, 404);

  // Cache hit: recent snapshots for this trip.
  const { data: cached } = await client
    .from('weather_snapshot')
    .select('date, temp_c, condition, location, fetched_at')
    .eq('trip_id', body.trip_id)
    .order('date', { ascending: true });
  if (cached && cached.length > 0) {
    const fresh = cached.every(
      (row) => Date.now() - new Date(row.fetched_at).getTime() < CACHE_TTL_MS,
    );
    if (fresh) return json({ snapshots: cached }, 200);
  }

  // Fallback: any failure returns whatever we have cached, never blocks the user.
  try {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip.destination)}&count=1`,
    ).then((r) => r.json());
    const place = geo?.results?.[0];
    if (!place) return json({ snapshots: cached ?? [] }, 200);

    const forecast = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
        `&daily=temperature_2m_max,weathercode&timezone=auto&start_date=${trip.start_date}&end_date=${trip.end_date}`,
    ).then((r) => r.json());

    const days: string[] = forecast?.daily?.time ?? [];
    const temps: number[] = forecast?.daily?.temperature_2m_max ?? [];
    const codes: number[] = forecast?.daily?.weathercode ?? [];
    const snapshots: Snapshot[] = days.map((date, i) => ({
      date,
      temp_c: temps[i] ?? null,
      condition: CONDITIONS[codes[i]] ?? null,
      location: place.name,
    }));

    // Refresh the cache for this trip.
    await client.from('weather_snapshot').delete().eq('trip_id', body.trip_id);
    if (snapshots.length > 0) {
      await client
        .from('weather_snapshot')
        .insert(snapshots.map((s) => ({ ...s, trip_id: body.trip_id })));
    }
    return json({ snapshots }, 200);
  } catch {
    return json({ snapshots: cached ?? [] }, 200);
  }
});
