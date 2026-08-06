-- T-0607 · RPC transaccional para guardar un outfit con sus items.
-- security invoker: auth.uid() = quien llama y la RLS aplica a outfit/outfit_item.
-- Valida ≥1 item y que todas las prendas referenciadas son del usuario.
-- `items` es un array jsonb de { garment_id, pos_x, pos_y, z_index, rotation, scale }.

create function save_outfit(name text, items jsonb) returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  new_outfit_id uuid;
  referenced int;
  owned int;
begin
  if items is null or jsonb_array_length(items) < 1 then
    raise exception 'an outfit needs at least one item';
  end if;

  select count(distinct (elem->>'garment_id')::uuid) into referenced
  from jsonb_array_elements(items) as elem;

  -- RLS scopes this select to the caller's garments.
  select count(distinct g.id) into owned
  from public.garment g
  where g.id in (select (elem->>'garment_id')::uuid from jsonb_array_elements(items) as elem);

  if owned <> referenced then
    raise exception 'all garments must belong to the caller';
  end if;

  insert into public.outfit (user_id, name)
  values (auth.uid(), name)
  returning id into new_outfit_id;

  insert into public.outfit_item (outfit_id, garment_id, pos_x, pos_y, z_index, rotation, scale)
  select new_outfit_id,
         (elem->>'garment_id')::uuid,
         coalesce((elem->>'pos_x')::numeric, 0),
         coalesce((elem->>'pos_y')::numeric, 0),
         coalesce((elem->>'z_index')::int, 0),
         coalesce((elem->>'rotation')::numeric, 0),
         coalesce((elem->>'scale')::numeric, 1)
  from jsonb_array_elements(items) as elem;

  return new_outfit_id;
end $$;

grant execute on function save_outfit(text, jsonb) to authenticated;
