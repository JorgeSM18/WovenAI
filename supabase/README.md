# Supabase (Woven)

Backend: Postgres + Auth + Storage + Edge Functions. **Sin secretos en el repositorio** (ver `docs/AI_GUIDE/06 §14`).

## CLI

El CLI está como devDependency; úsalo con `pnpm exec supabase ...` o los scripts `pnpm db:*`.

| Script          | Acción                                            |
| --------------- | ------------------------------------------------- |
| `pnpm db:start` | Levanta la pila local (requiere Docker)           |
| `pnpm db:stop`  | Detiene la pila local                             |
| `pnpm db:reset` | Recrea la BD local aplicando `migrations/` + seed |
| `pnpm db:diff`  | Genera una migración desde cambios locales        |
| `pnpm db:push`  | Aplica `migrations/` al proyecto enlazado         |
| `pnpm db:lint`  | Linter de esquema                                 |

## Entornos (dev / staging / prod)

Cada entorno es un **proyecto Supabase** distinto. El enlace se hace por CLI, **nunca con secretos en el repo**:

```bash
# 1) Token personal en tu entorno (NO en el repo)
export SUPABASE_ACCESS_TOKEN=***
# 2) Enlazar el entorno por su project-ref
pnpm exec supabase link --project-ref <ref-del-entorno>
```

| Entorno | Estado                                    |
| ------- | ----------------------------------------- |
| dev     | proyecto existente (se enlaza localmente) |
| staging | ⛔ pendiente de crear                     |
| prod    | ⛔ pendiente de crear                     |

> El `project-ref` y la URL son públicos, pero el **enlace y las claves** se gestionan por CLI/entorno. Las claves (`anon`/`publishable`, `service_role`, contraseña de BD) van a **`.env`** (T-0009) y a **Supabase secrets** (Edge), nunca al repositorio.

## Estructura

- `config.toml` — configuración local del CLI (puertos, auth, storage…).
- `migrations/` — SQL **forward-only** (T-0201+). Nunca editar una migración ya aplicada.
- `functions/` — Edge Functions (Deno) (E09).

## Desarrollo local

Requiere **Docker**. `pnpm db:start` levanta Postgres/Auth/Storage/Studio locales; `pnpm db:reset` aplica migraciones + seed. El esquema y las políticas RLS llegan en tareas posteriores (T-0201+).
