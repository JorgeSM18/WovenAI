-- T-0203 · Outfits (ARCHITECTURE/07 §7.6) · RLS -> T-0204

create table outfit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile (id) on delete cascade,
  name text,
  match_score int check (match_score between 0 and 100),
  occasion text,
  cover_image_id uuid references image_asset (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table outfit_item (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references outfit (id) on delete cascade,
  garment_id uuid not null references garment (id), -- sin cascade: soft-delete de garment
  pos_x numeric not null default 0,
  pos_y numeric not null default 0,
  z_index int not null default 0,
  rotation numeric not null default 0,
  scale numeric not null default 1,
  unique (outfit_id, z_index) -- capas únicas por outfit
);
