-- T-0904 · Embeddings de prenda a 768 dims (Nomic Embed v1.5) + RPC de búsqueda
-- semántica. La columna `embedding` se creó a 1536 en 0004 (dim provisional,
-- PD-05); Nomic Embed v1.5 usa 768. Aún no hay embeddings (beta), así que se
-- recrea la columna. `security invoker` en la RPC => la RLS de `garment`
-- restringe la búsqueda a las prendas del usuario que llama (ADR-006/016).

-- Recrea la columna a la dimensión de Nomic (768). pgvector ya se habilitó en 0004.
alter table garment drop column if exists embedding;
alter table garment add column embedding vector(768);

-- Índice ANN para similitud coseno (§7.9).
create index garment_embedding_hnsw on garment
  using hnsw (embedding vector_cosine_ops);

-- Búsqueda semántica sobre las prendas del propio usuario (la RLS aplica por
-- invoker). Devuelve id + similitud (1 - distancia coseno), más similar primero.
-- search_path incluye el schema de pgvector (public/extensions) para resolver el
-- operador `<=>`; con '' quedaría fuera y la creación de la función falla.
create function search_garments(query_embedding vector(768), match_count int default 20)
  returns table (id uuid, similarity real)
  language sql
  stable
  security invoker
  set search_path = public, extensions
as $$
  select g.id, (1 - (g.embedding <=> query_embedding))::real as similarity
  from public.garment g
  where g.embedding is not null
    and g.deleted_at is null
  order by g.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function search_garments(vector, integer) to authenticated;
