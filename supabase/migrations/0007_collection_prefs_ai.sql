-- T-0203 · Collections, preferencias y recomendaciones (ARCHITECTURE/07 §7.8)
-- RLS -> T-0204

create table collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile (id) on delete cascade,
  name text not null,
  is_ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table collection_item (
  collection_id uuid not null references collection (id) on delete cascade,
  garment_id uuid not null references garment (id) on delete cascade,
  primary key (collection_id, garment_id)
);

create table style_preference (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile (id) on delete cascade,
  tag text not null
);
-- El doc usa `unique (user_id, lower(tag))`, inválido en un UNIQUE de tabla
-- (no admite expresiones). Va como índice único (mismo caso que brand).
create unique index style_preference_user_tag_key
  on style_preference (user_id, lower(tag));

create table ai_recommendation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile (id) on delete cascade,
  type ai_reco_type not null,
  context jsonb not null default '{}',
  garment_id uuid references garment (id) on delete cascade,
  outfit_id uuid references outfit (id) on delete cascade,
  trip_id uuid references trip (id) on delete cascade,
  message text,
  status ai_reco_status not null default 'active',
  created_at timestamptz not null default now()
);
