-- T-0207 · Seeds de referencia (ARCHITECTURE/07 §7.13). Idempotentes: se aplican
-- en cada `db reset` y no duplican (guardas por nombre / on conflict).
-- Los hex de color son provisionales; el diseño puede refinarlos (swatches).
-- La taxonomía de categorías es inicial y plana (jerarquía = PD-13).

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
