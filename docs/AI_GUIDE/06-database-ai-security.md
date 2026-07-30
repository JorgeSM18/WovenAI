# 06 · Base de datos · IA · Seguridad

## 12. Base de datos (PostgreSQL / Supabase)

### 12.1 Migraciones
- **Forward-only.** **Prohibido editar una migración ya aplicada** (§18); crear una nueva.
- Una migración = un cambio atómico, nombrada `NNNN_snake_case.sql`, versionada en Git.
- Cambios de esquema con **expand/contract** (añadir → migrar datos → eliminar en migración posterior), nunca destructivos de golpe en prod.
- Tras cambiar esquema: regenerar tipos (`supabase gen types`) y commitearlos; CI falla si difieren.

### 12.2 RLS (obligatoria)
- **Toda tabla de usuario con RLS activada** y política `user_id = auth.uid()` (o join al padre para tablas hijas). Tabla nueva **sin RLS = defecto bloqueante**.
- Toda nueva tabla incluye su test de **aislamiento entre usuarios** en el mismo PR.
- Buckets de Storage **privados**; acceso solo con URLs firmadas de vida corta.

### 12.3 Nombres e índices
- `snake_case` para tablas/columnas; PK `uuid` (`gen_random_uuid()`); `created_at`/`updated_at timestamptz`; soft-delete con `deleted_at` donde el TAD lo indica.
- **Índices** para todo patrón de acceso real (listados por `user_id`, filtros por estado/favorito/last_worn, joins M:N, `pgvector`). No añadir índices especulativos.

### 12.4 Queries
- CRUD por **PostgREST** vía repositorios (`packages/data`), con RLS. Consultas complejas por **RPC** (SQL) — no reconstruir lógica SQL en el cliente.
- Paginación **keyset**. **Prohibido** `select('*')` sin necesidad; pedir columnas necesarias.
- **Prohibido** acceso directo a Supabase desde presentación/UI (§3.2).

### 12.5 Edge Functions
- Toda lógica con **secretos/terceros/efectos** va en Edge Functions (recorte, clasificación, embeddings, recomendación, clima, batch, firmas). **Prohibido** llamar a terceros desde el cliente.
- Cada función: **valida JWT**, aplica **rate-limit**, es **idempotente** donde aplica, valida entrada y **respuesta con Zod**, registra latencia y coste.

## 13. IA

### 13.1 Prompts
- Prompts **versionados** en `supabase/functions/<fn>/prompts.ts`, bajo control de versiones (cambiar un prompt = PR revisado).
- Salida **siempre estructurada** (JSON schema / function calling) y **validada con Zod**. **Prohibido** parsear texto libre.
- **Guardrails**: no inventar categorías fuera del catálogo; ante duda, devolver `unknown`/baja confianza, no alucinar. Incluir preferencias de estilo del usuario y taxonomía como contexto.
- `temperature` baja para tareas deterministas (clasificación).

### 13.2 Costes y caching
- **Caché obligatoria**: recorte por hash de imagen (idempotente), embeddings persistidos en `garment.embedding` (recalcular solo si cambia imagen/atributos), recomendaciones por hash del conjunto, clima por (location, date).
- **Batch** para Burst/Import. Resolución de imagen mínima suficiente; tokens acotados.
- **Instrumentar coste** por función/usuario (Sentry/PostHog); alertas de gasto.

### 13.3 Fallbacks y retries
- Fallbacks obligatorios: recorte falla → original + reintento; clasificación falla → prenda con campos editables; recomendación no disponible → ocultar match/sugerencias; clima no disponible → sin packing insight; embeddings caídos → búsqueda por atributos.
- **Nunca** un fallo de IA bloquea el flujo del usuario.
- Retries con **backoff + jitter**; límite de intentos; errores no-retryables (validación) no se reintentan.

### 13.4 Logging
- Logs estructurados (JSON) con `request_id`, `user_id` hasheado, función, latencia, coste, resultado (sin datos sensibles innecesarios). Respetar privacidad (§14).

## 14. Seguridad

- **Nunca guardar secretos** en el repo, cliente, ni logs. Claves de terceros solo en **Supabase secrets** (Edge). Sesión en `expo-secure-store` (móvil), no en MMKV plano.
- **Nunca exponer claves** en el bundle del cliente ni en respuestas.
- **Validar siempre** en frontera: Zod en cliente **y** constraints/checks/triggers en Postgres. No confiar solo en cliente.
- **Escapar/parametrizar** datos: nunca construir SQL por concatenación; usar el SDK/RPC. Sanitizar cualquier HTML si se renderizara (evitar XSS en web).
- **Mínimo privilegio**: RLS restringe por usuario; Edge Functions con el permiso justo; buckets privados; URLs firmadas de vida corta.
- **Privacidad de imágenes**: buckets privados, EXIF (geolocalización) eliminado en compresión, sin datos personales en URLs/query params.
- **Rate limiting** en endpoints IA y subida de imágenes.
- **Prohibido** desactivar RLS "temporalmente", subir `.env`, loguear tokens, o usar `service_role` desde el cliente.
