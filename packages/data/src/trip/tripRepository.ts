import type { Database, WovenClient } from '@woven/api';
import type { Trip, TripDraft } from '@woven/core';

type TripRow = Database['public']['Tables']['trip']['Row'];

function rowToTrip(
  row: Pick<TripRow, 'id' | 'destination' | 'start_date' | 'end_date' | 'status'>,
): Trip {
  return {
    id: row.id,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
  };
}

/** The user's trips, soonest start first. RLS scopes to the caller. */
export async function listTrips(client: WovenClient): Promise<Trip[]> {
  const { data, error } = await client
    .from('trip')
    .select('id, destination, start_date, end_date, status')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data.map(rowToTrip);
}

/** Creates a trip (status defaults to upcoming). Returns the new trip id.
 *  The DB also enforces start_date <= end_date. */
export async function createTrip(
  client: WovenClient,
  userId: string,
  draft: TripDraft,
): Promise<string> {
  const { data, error } = await client
    .from('trip')
    .insert({
      user_id: userId,
      destination: draft.destination.trim(),
      start_date: draft.startDate,
      end_date: draft.endDate,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}
