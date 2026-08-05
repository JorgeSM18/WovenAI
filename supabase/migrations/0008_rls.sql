-- T-0204 · Row Level Security en todas las tablas (ARCHITECTURE/07 §7.10)
-- Patrones: (a) user_id directo, (b) join al padre, (c) referencia global.
-- El rol service_role hace BYPASSRLS -> las escrituras a tablas de referencia
-- no necesitan policy (solo el backend/seeds las escriben).
-- Test de aislamiento entre usuarios: T-0307.

-- (a) Tablas con user_id directo: dueño lee y escribe lo suyo.
alter table garment enable row level security;
create policy garment_rw on garment
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table image_asset enable row level security;
create policy image_asset_rw on image_asset
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table outfit enable row level security;
create policy outfit_rw on outfit
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table trip enable row level security;
create policy trip_rw on trip
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table collection enable row level security;
create policy collection_rw on collection
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table style_preference enable row level security;
create policy style_preference_rw on style_preference
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table ai_recommendation enable row level security;
create policy ai_recommendation_rw on ai_recommendation
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- profile: la fila ES el usuario (id = auth.uid()).
alter table profile enable row level security;
create policy profile_rw on profile
  using (id = auth.uid()) with check (id = auth.uid());

-- (b) Tablas hijas sin user_id: RLS por join al padre.
alter table outfit_item enable row level security;
create policy outfit_item_rw on outfit_item
  using (exists (select 1 from outfit o where o.id = outfit_id and o.user_id = auth.uid()))
  with check (exists (select 1 from outfit o where o.id = outfit_id and o.user_id = auth.uid()));

alter table collection_item enable row level security;
create policy collection_item_rw on collection_item
  using (exists (select 1 from collection c where c.id = collection_id and c.user_id = auth.uid()))
  with check (exists (select 1 from collection c where c.id = collection_id and c.user_id = auth.uid()));

alter table garment_fabric enable row level security;
create policy garment_fabric_rw on garment_fabric
  using (exists (select 1 from garment g where g.id = garment_id and g.user_id = auth.uid()))
  with check (exists (select 1 from garment g where g.id = garment_id and g.user_id = auth.uid()));

alter table trip_day enable row level security;
create policy trip_day_rw on trip_day
  using (exists (select 1 from trip t where t.id = trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from trip t where t.id = trip_id and t.user_id = auth.uid()));

alter table trip_garment enable row level security;
create policy trip_garment_rw on trip_garment
  using (exists (select 1 from trip t where t.id = trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from trip t where t.id = trip_id and t.user_id = auth.uid()));

alter table weather_snapshot enable row level security;
create policy weather_snapshot_rw on weather_snapshot
  using (exists (select 1 from trip t where t.id = trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from trip t where t.id = trip_id and t.user_id = auth.uid()));

-- (c) Tablas de referencia globales: lectura para autenticados; escritura solo
-- service_role (bypass RLS), sin policy de escritura.
alter table color enable row level security;
create policy color_read on color for select using (auth.role() = 'authenticated');

alter table fabric enable row level security;
create policy fabric_read on fabric for select using (auth.role() = 'authenticated');

alter table category enable row level security;
create policy category_read on category for select using (auth.role() = 'authenticated');

-- brand: globales visibles para todos; las de usuario, solo su dueño (lee/escribe).
alter table brand enable row level security;
create policy brand_read on brand for select
  using (is_global or user_id = auth.uid());
create policy brand_write_own on brand
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- GRANTs para el rol de la Data API. Supabase ya NO auto-expone tablas nuevas
-- (config `auto_expose_new_tables` en su default), así que sin estos GRANT el
-- acceso base queda denegado aunque exista policy. RLS es quien restringe las
-- filas; el GRANT solo habilita la operación. service_role hace BYPASSRLS.
grant select, insert, update, delete on
  profile, image_asset, garment, garment_fabric,
  outfit, outfit_item, trip, trip_day, trip_garment, weather_snapshot,
  collection, collection_item, style_preference, ai_recommendation, brand
to authenticated;

grant select on color, fabric, category to authenticated;
