-- T-0201 · Tipos enumerados del dominio (ARCHITECTURE/07 §7.2)
-- `category` se modela como tabla de referencia (PD-13), no enum.

create type garment_status as enum ('processing', 'active', 'archived');
create type season as enum ('spring', 'summer', 'fall', 'winter');
create type image_type as enum ('original', 'processed', 'avatar', 'outfit_cover');
create type trip_status as enum ('upcoming', 'active', 'past');
create type ai_reco_type as enum (
  'outfit_suggestion', 'forgotten_piece', 'packing_insight',
  'wardrobe_insight', 'wardrobe_whisper', 'texture_clash', 'nudge'
);
create type ai_reco_status as enum ('active', 'dismissed', 'applied');
create type theme_pref as enum ('light', 'dark', 'system');
create type units_pref as enum ('metric', 'imperial');
create type view_density as enum ('editorial', 'compact', 'categories');
