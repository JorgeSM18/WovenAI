-- T-0201 · Tablas de referencia (ARCHITECTURE/07 §7.3)
-- RLS/lectura pública autenticada: se habilita en T-0204 (§7.10).

create table brand (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_global boolean not null default false, -- catálogo curado vs libre (PD)
  user_id uuid references profile (id) on delete cascade -- null si global
);
-- El doc usa `unique (coalesce(user_id::text,'global'), lower(name))`, que no es
-- válido en un UNIQUE de tabla (no admite expresiones). Va como índice único.
create unique index brand_owner_name_key
  on brand (coalesce(user_id::text, 'global'), lower(name));

create table color (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hex text not null check (hex ~ '^#[0-9a-fA-F]{6}$')
);

create table fabric (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table category (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references category (id), -- jerarquía (PD-13)
  sort int not null default 0
);
