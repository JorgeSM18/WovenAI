-- T-0207b · Datos de referencia REQUERIDOS (categorías, colores, fabrics) como
-- migración, no solo en seed.sql: `supabase db push` no ejecuta seed.sql, así que
-- sin esto el proyecto hosted queda sin categorías/colores y no se pueden crear
-- prendas. Idempotente (guardas por nombre) → convive con seed.sql en `db reset`.

insert into fabric (name)
values ('Linen'), ('Wool'), ('Cashmere'), ('Silk'), ('Cotton'), ('Denim'), ('Leather')
on conflict (name) do nothing;

insert into color (name, hex)
select v.name, v.hex
from (values
  ('Black', '#000000'),
  ('White', '#ffffff'),
  ('Grey', '#808080'),
  ('Navy', '#1f2a44'),
  ('Blue', '#2563eb'),
  ('Light Blue', '#93c5fd'),
  ('Red', '#dc2626'),
  ('Pink', '#ec4899'),
  ('Green', '#16a34a'),
  ('Olive', '#556b2f'),
  ('Yellow', '#eab308'),
  ('Orange', '#ea580c'),
  ('Brown', '#6b4f3a'),
  ('Beige', '#e8dcc4'),
  ('Purple', '#7c3aed')
) as v(name, hex)
where not exists (select 1 from color c where c.name = v.name);

insert into category (name, sort)
select v.name, v.sort
from (values
  ('Tops', 10),
  ('Bottoms', 20),
  ('Outerwear', 30),
  ('Dresses', 40),
  ('Footwear', 50),
  ('Bags', 60),
  ('Accessories', 70)
) as v(name, sort)
where not exists (select 1 from category c where c.name = v.name);
