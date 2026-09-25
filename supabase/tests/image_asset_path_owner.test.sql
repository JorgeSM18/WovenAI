-- Aislamiento: un usuario no puede registrar un image_asset que apunte a la
-- carpeta de Storage de otro usuario (migración 0015). Ejecutar: supabase test db
begin;
select plan(3);

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.local');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select lives_ok(
  $$insert into image_asset (user_id, storage_path, type, mime)
    values ('00000000-0000-0000-0000-00000000000a',
            'images/00000000-0000-0000-0000-00000000000a/original/x.jpg', 'original', 'image/jpeg')$$,
  'own folder is allowed'
);

select throws_ok(
  $$insert into image_asset (user_id, storage_path, type, mime)
    values ('00000000-0000-0000-0000-00000000000a',
            'images/00000000-0000-0000-0000-00000000000b/original/x.jpg', 'original', 'image/jpeg')$$,
  '23514',
  null,
  'another user''s folder is rejected'
);

select throws_ok(
  $$update image_asset set storage_path = 'images/00000000-0000-0000-0000-00000000000b/original/x.jpg'
    where user_id = '00000000-0000-0000-0000-00000000000a'$$,
  '23514',
  null,
  'repointing an existing row to another user''s folder is rejected'
);

select * from finish();
rollback;
