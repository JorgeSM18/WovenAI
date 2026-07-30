# 03 · Monorepo

## 3.1 Herramientas

- **pnpm workspaces** — gestión de dependencias con enlaces simbólicos eficientes y `node_modules` estricto (evita *phantom deps*).
- **Turborepo** — orquestación de tareas con caché por paquete (`build`, `lint`, `test`, `typecheck`), pipelines y builds incrementales/afectados.
- **Changesets** (opcional) — versionado de paquetes internos.
- Justificación vs Nx: Turborepo es más ligero y suficiente; Nx aporta generadores que no necesitamos (ADR-009).

## 3.2 Estructura de carpetas

```
woven/
├─ apps/
│  ├─ mobile/                 # Expo app (RN + Expo Router)
│  │  ├─ app/                 # rutas file-based (ver 05-navigation)
│  │  ├─ app.config.ts        # config Expo (EAS, plugins, permisos)
│  │  └─ src/                 # bootstrapping, providers de plataforma
│  └─ web/                    # React + Vite
│     ├─ src/routes/          # rutas web (espejo semántico de mobile)
│     └─ index.html
│
├─ packages/
│  ├─ core/                   # DOMINIO: entidades, tipos, zod, casos de uso, interfaces
│  │  ├─ entities/            # Garment, Outfit, Trip, Collection...
│  │  ├─ schemas/             # zod (validación captura, trips...)
│  │  ├─ usecases/            # reglas puras (forgottenPieces, validateTrip, isOutfitComplete)
│  │  └─ ports/               # interfaces de repositorios y servicios
│  ├─ data/                   # INFRA de datos: repositorios Supabase + hooks TanStack Query
│  │  ├─ repositories/        # implementaciones de core/ports (Supabase)
│  │  ├─ queries/             # useGarments, useOutfit, useCreateGarment...
│  │  ├─ queryKeys.ts         # fábrica de claves de caché
│  │  └─ offline/             # persistencia de caché + cola offline
│  ├─ store/                  # Zustand stores (studioDraft, inventoryFilters, offlineQueue, ui)
│  ├─ ui/                     # DESIGN SYSTEM (Atomic Design) — RN + web (NativeWind)
│  │  ├─ atoms/ molecules/ organisms/ templates/
│  │  └─ theme/               # tokens re-exportados del preset
│  ├─ api/                    # cliente Supabase + wrappers de Edge Functions + tipos de API
│  │  ├─ supabase.ts          # createClient (con storage adapter por plataforma)
│  │  ├─ edge/                # invocadores tipados de Edge Functions
│  │  └─ generated/           # tipos generados de la BD (supabase gen types)
│  ├─ config/                 # tsconfig base, eslint, tailwind preset (tokens), prettier
│  ├─ analytics/              # wrapper PostHog + Sentry (interfaz Telemetry)
│  └─ i18n/                   # infra de internacionalización (⛔ PD-10 idiomas)
│
├─ supabase/                  # BACKEND declarativo
│  ├─ migrations/             # SQL versionado (ver 07)
│  ├─ functions/              # Edge Functions (Deno) (ver 08, 09)
│  ├─ seed/                   # seeds (referencia: colors, fabrics, seasons)
│  └─ config.toml
│
├─ shared/                    # (opcional) constantes/utilidades sin dependencias
├─ scripts/                   # scripts de repo (gen types, release, checks)
├─ assets/                    # fuentes (Hanken Grotesk), íconos base, imágenes estáticas
├─ types/                     # (si se prefiere separar) d.ts globales
├─ .github/workflows/         # CI/CD (ver 11)
├─ turbo.json                 # pipelines Turborepo
├─ pnpm-workspace.yaml
└─ package.json
```

> Nota: el enunciado sugiere carpetas `config/ scripts/ assets/ types/ ui/ api/ database/`. Mapeo: `config→packages/config`, `ui→packages/ui`, `api→packages/api`, `database→supabase/`, `types→packages/api/generated` (+ `types/` global), `scripts/assets` en raíz. Se prioriza `packages/*` para todo lo importable por las apps.

## 3.3 Qué contiene cada paquete (contrato de responsabilidad)

| Paquete | Contiene | Depende de | Prohibido |
|---|---|---|---|
| `core` | Dominio puro: entidades, Zod, casos de uso, **interfaces** (ports) | nada de framework | React, Supabase, RN |
| `data` | Repositorios (impl. de `core/ports`) + hooks TanStack Query + offline | `core`, `api` | JSX, componentes |
| `api` | Cliente Supabase, invocadores de Edge Functions, tipos generados | `core` (tipos) | UI |
| `store` | Zustand stores de UI/efímero | `core` (tipos) | datos de servidor duplicados |
| `ui` | Design system (Atomic) RN+web | `config`, `core` (tipos) | acceso a datos/red |
| `config` | tsconfig, eslint, **tailwind preset (tokens)** | — | lógica de negocio |
| `analytics` | Telemetría (PostHog+Sentry) tras interfaz `Telemetry` | `core` | UI |
| `i18n` | Infra de traducciones | — | textos hardcodeados dispersos |

## 3.4 Reglas de dependencia (forzadas por lint)

- `apps/*` pueden importar cualquier `packages/*`.
- `packages/core` **no** importa ningún otro paquete ni framework.
- `packages/ui` **no** importa `data`/`api`/`store` (solo recibe props y tipos de `core`).
- `packages/data` importa `core` + `api`, nunca `ui`.
- Regla ESLint `no-restricted-imports` + boundaries (ESLint plugin) que bloquea violaciones en CI (ADR-013).

## 3.5 Compartición de código (objetivo del proyecto)

| Capa | ¿Compartido Web/Mobile? |
|---|---|
| Dominio (`core`) | 100% |
| Datos/estado (`data`, `store`, `api`) | 100% |
| Design system (`ui`) | ~90% (NativeWind permite componentes RN que renderizan en web; casos específicos por plataforma con extensión `.native.tsx` / `.web.tsx`) |
| Navegación | Estructura compartida (Expo Router también corre en web); layouts divergen levemente (bottom nav vs top nav) |
| Presentación de pantallas | Mayoría compartida vía componentes; diferencias resueltas con archivos de plataforma |

Mecanismo de divergencia por plataforma: **Metro/bundler resuelve `*.native.tsx` vs `*.web.tsx`** para el mismo módulo, manteniendo una única API de import.

## 3.6 Turborepo pipelines (resumen)

```jsonc
// turbo.json (extracto conceptual)
{
  "pipeline": {
    "build":    { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "typecheck":{ "dependsOn": ["^build"] },
    "lint":     {},
    "test":     { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "gen:types":{ "cache": false }
  }
}
```
- CI ejecuta solo lo **afectado** (`turbo run ... --filter=...[HEAD^]`).
