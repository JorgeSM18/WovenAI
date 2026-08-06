-- T-0205 · Bucket privado de imágenes + RLS por path (ARCHITECTURE/09 §10.3, §7.10)
-- Path convenido: `<user_id>/<type>/<uuid>` — el primer segmento identifica al
-- dueño. storage.objects ya tiene RLS habilitada por Supabase; añadimos policies.
-- Subida vía URL firmada (Edge `sign-upload`). service_role hace BYPASSRLS.

insert into storage.buckets (id, name, public)
values ('images', 'images', false)
on conflict (id) do nothing;

create policy "images_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "images_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "images_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "images_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
