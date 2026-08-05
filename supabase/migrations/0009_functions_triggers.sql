-- T-0206 · Funciones y triggers (ARCHITECTURE/07 §7.11)
-- `search_garments` (RPC de búsqueda semántica) queda fuera: depende del índice
-- del embedding y del repositorio (E09), no de esta tarea.
-- Todas las funciones fijan `search_path = ''` (seguridad + db lint) y cualifican
-- las tablas con esquema.

-- 1) updated_at automático (tablas con esa columna: profile, garment, outfit, trip, collection)
create function set_updated_at() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profile_updated before update on profile
  for each row execute function set_updated_at();
create trigger trg_garment_updated before update on garment
  for each row execute function set_updated_at();
create trigger trg_outfit_updated before update on outfit
  for each row execute function set_updated_at();
create trigger trg_trip_updated before update on trip
  for each row execute function set_updated_at();
create trigger trg_collection_updated before update on collection
  for each row execute function set_updated_at();

-- 2) crear la fila de profile al registrarse (Supabase Auth). SECURITY DEFINER
-- para poder escribir en public.profile desde el trigger sobre auth.users.
create function handle_new_user() returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.profile (id, email) values (new.id, new.email);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- 3) trip_day.date dentro del rango del viaje
create function check_trip_day_range() returns trigger
  language plpgsql
  set search_path = ''
as $$
declare
  s date;
  e date;
begin
  select start_date, end_date into s, e from public.trip where id = new.trip_id;
  if new.date < s or new.date > e then
    raise exception 'trip_day.date % fuera del rango del viaje (% .. %)', new.date, s, e;
  end if;
  return new;
end $$;

create trigger trg_tripday_range before insert or update on trip_day
  for each row execute function check_trip_day_range();

-- 4) soft-delete de garment (marca deleted_at; conserva referencias en outfits/trips).
-- Invoker: auth.uid() es quien llama y la RLS aplica. RPC llamada por el repositorio.
create function soft_delete_garment(g uuid) returns void
  language sql
  set search_path = ''
as $$
  update public.garment set deleted_at = now(), status = 'archived'
  where id = g and user_id = auth.uid();
$$;

grant execute on function soft_delete_garment(uuid) to authenticated;
