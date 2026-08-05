-- T-0203 · Trips (ARCHITECTURE/07 §7.7) · RLS -> T-0204
-- trip_day.date dentro del rango del viaje: trigger en T-0206.

create table trip (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile (id) on delete cascade,
  destination text not null,
  start_date date not null,
  end_date date not null,
  status trip_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date <= end_date)
);

create table trip_day (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trip (id) on delete cascade,
  date date not null,
  outfit_id uuid references outfit (id) on delete set null, -- 1 por día
  is_outfit_complete boolean not null default false, -- derivado
  label text,
  unique (trip_id, date)
);

create table trip_garment (
  trip_id uuid not null references trip (id) on delete cascade,
  garment_id uuid not null references garment (id),
  primary key (trip_id, garment_id)
);

create table weather_snapshot (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trip (id) on delete cascade,
  date date not null,
  temp_c numeric,
  condition text,
  location text,
  fetched_at timestamptz not null default now()
);
