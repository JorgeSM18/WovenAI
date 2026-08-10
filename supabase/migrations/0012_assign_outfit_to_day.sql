-- T-0804 · RPC para asignar un outfit a un día del viaje (upsert de trip_day).
-- security invoker: RLS aplica; valida que trip y outfit son del usuario.
-- El trigger check_trip_day_range (0009) valida que la fecha cae en el viaje.

create function assign_outfit_to_day(p_trip uuid, p_date date, p_outfit uuid) returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  day_id uuid;
begin
  if not exists (select 1 from public.trip t where t.id = p_trip and t.user_id = auth.uid()) then
    raise exception 'trip not found';
  end if;
  if not exists (select 1 from public.outfit o where o.id = p_outfit and o.user_id = auth.uid()) then
    raise exception 'outfit not found';
  end if;

  insert into public.trip_day (trip_id, date, outfit_id)
  values (p_trip, p_date, p_outfit)
  on conflict (trip_id, date) do update set outfit_id = excluded.outfit_id
  returning id into day_id;

  return day_id;
end $$;

grant execute on function assign_outfit_to_day(uuid, date, uuid) to authenticated;
