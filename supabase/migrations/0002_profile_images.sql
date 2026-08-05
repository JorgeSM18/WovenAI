-- T-0201 · Perfil e imágenes (ARCHITECTURE/07 §7.4)
-- Va antes que las tablas de referencia porque `brand.user_id` -> profile(id).
-- RLS: se habilita en T-0204 (§7.10). Sin flujos de datos hasta entonces.

create table profile (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text unique,
  avatar_asset_id uuid, -- FK diferida a image_asset (abajo)
  has_completed_onboarding boolean not null default false,
  view_density_pref view_density not null default 'editorial',
  theme_pref theme_pref not null default 'system',
  units_pref units_pref not null default 'metric',
  language text not null default 'en-GB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table image_asset (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profile (id) on delete cascade,
  storage_path text not null, -- bucket/key privado
  type image_type not null,
  width int,
  height int,
  mime text,
  bytes int,
  created_at timestamptz not null default now()
);

alter table profile
  add constraint profile_avatar_fk
  foreign key (avatar_asset_id) references image_asset (id) on delete set null;
