import type { Database, WovenClient } from '@woven/api';
import type { Trip, TripDraft } from '@woven/core';

import { signedThumbnailsByGarment } from '../garment/thumbnails';

type TripRow = Database['public']['Tables']['trip']['Row'];

export type TripGarment = {
  garmentId: string;
  name: string;
  thumbnailUrl: string | null;
};

export type TripDayAssignment = {
  date: string;
  outfitId: string | null;
};

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

export async function getTrip(client: WovenClient, id: string): Promise<Trip> {
  const { data, error } = await client
    .from('trip')
    .select('id, destination, start_date, end_date, status')
    .eq('id', id)
    .single();
  if (error) throw error;
  return rowToTrip(data);
}

/** Garments packed for a trip, with a signed thumbnail. */
export async function listTripGarments(
  client: WovenClient,
  tripId: string,
): Promise<TripGarment[]> {
  const { data: rows, error } = await client
    .from('trip_garment')
    .select('garment_id')
    .eq('trip_id', tripId);
  if (error) throw error;

  const ids = rows.map((row) => row.garment_id);
  if (ids.length === 0) return [];

  const { data: garments, error: garmentError } = await client
    .from('garment')
    .select('id, name')
    .in('id', ids);
  if (garmentError) throw garmentError;

  const thumbnails = await signedThumbnailsByGarment(client, ids);
  return garments.map((garment) => ({
    garmentId: garment.id,
    name: garment.name,
    thumbnailUrl: thumbnails.get(garment.id) ?? null,
  }));
}

export async function addTripGarment(
  client: WovenClient,
  tripId: string,
  garmentId: string,
): Promise<void> {
  const { error } = await client
    .from('trip_garment')
    .upsert({ trip_id: tripId, garment_id: garmentId }, { ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeTripGarment(
  client: WovenClient,
  tripId: string,
  garmentId: string,
): Promise<void> {
  const { error } = await client
    .from('trip_garment')
    .delete()
    .eq('trip_id', tripId)
    .eq('garment_id', garmentId);
  if (error) throw error;
}

/** Days of a trip that already have an outfit assigned. */
export async function getTripDays(
  client: WovenClient,
  tripId: string,
): Promise<TripDayAssignment[]> {
  const { data, error } = await client
    .from('trip_day')
    .select('date, outfit_id')
    .eq('trip_id', tripId);
  if (error) throw error;
  return data.map((row) => ({ date: row.date, outfitId: row.outfit_id }));
}

/** Assigns (or reassigns) an outfit to a trip day via the transactional RPC. */
export async function assignOutfitToDay(
  client: WovenClient,
  input: { tripId: string; date: string; outfitId: string },
): Promise<void> {
  const { error } = await client.rpc('assign_outfit_to_day', {
    p_trip: input.tripId,
    p_date: input.date,
    p_outfit: input.outfitId,
  });
  if (error) throw error;
}
