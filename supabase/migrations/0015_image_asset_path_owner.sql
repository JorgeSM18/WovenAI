-- Seguridad · image_asset.storage_path lo escribe el cliente y la RLS solo
-- comprueba user_id. Sin esto, un usuario podía crear una fila propia que
-- apuntase al fichero de OTRO usuario (`images/<victima>/...`); cualquier código
-- que lea Storage con service_role siguiendo esa ruta filtraría la imagen.
-- Obliga a que la ruta viva bajo la carpeta del dueño (convención de 0010).
-- NOT VALID: no revalida filas antiguas, pero aplica a todo INSERT/UPDATE nuevo.

alter table image_asset
  add constraint image_asset_path_owner
  check (starts_with(storage_path, 'images/' || user_id::text || '/'))
  not valid;
