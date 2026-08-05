-- T-0203 · Garment y relación con fabric (ARCHITECTURE/07 §7.5)
-- pgvector se habilita aquí: es la primera columna que usa `vector` (embedding).
-- RLS -> T-0204. Índices (incl. hnsw del embedding, §7.9) -> tarea de índices.

create extension if not exists vector;

create table garment (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile (id) on delete cascade,
  name text not null,
  category_id uuid not null references category (id),
  brand_id uuid references brand (id) on delete set null,
  primary_color_id uuid not null references color (id),
  season season,
  style text[] not null default '{}',
  original_image_id uuid references image_asset (id) on delete set null,
  processed_image_id uuid references image_asset (id) on delete set null,
  is_favorite boolean not null default false,
  status garment_status not null default 'processing',
  last_worn_at timestamptz,
  purchase_price numeric(10, 2), -- PD-07
  embedding vector(1536), -- dim segun modelo (PD-05)
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table garment_fabric (
  garment_id uuid not null references garment (id) on delete cascade,
  fabric_id uuid not null references fabric (id) on delete cascade,
  primary key (garment_id, fabric_id)
);
