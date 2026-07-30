# 02 · Stack tecnológico

Cada tecnología incluye **por qué** y **alternativa descartada**. Versiones exactas se fijan en `package.json`/`app.json` (⛔ **PD** versiones concretas; política: LTS/estables).

## 2.1 Frontend

### React Native + Expo (SDK gestionado, EAS)
- **Por qué:** móvil es la plataforma principal (Captura, drag del Studio, uso diario). Expo aporta módulos nativos listos (cámara, image picker, permisos, biometría, secure store, notificaciones), **EAS Build/Submit/Update** (OTA), y elimina la gestión manual de proyectos nativos.
- **Descartado:** RN "bare"/CLI (más coste de mantenimiento nativo sin beneficio para este alcance); Flutter (rompería el objetivo de compartir código TS con la web y el dominio).

### React (web) + Vite
- **Por qué:** segunda plataforma; comparte dominio/datos/estado/UI. Vite = arranque y HMR rápidos, build simple para SPA.
- **Descartado (por ahora):** Next.js — solo si aparece necesidad real de SSR/SEO (marketing/compartir público, ligado a `PD-03`). Se deja como decisión reversible (ADR-002). SPA cubre la app autenticada.

### Expo Router
- **Por qué:** enrutado file-based, layouts anidados, deep links y rutas compartibles; casa con la taxonomía de 5 tabs + flujos full-screen (Captura/Studio). Unifica el modelo mental de navegación con el de web.
- **Descartado:** React Navigation "a mano" (más boilerplate; Expo Router lo usa por debajo pero con DX superior).

### TypeScript (estricto)
- **Por qué:** contrato único de tipos entre clientes y backend (tipos generados de Postgres + Zod). `strict: true`, `noUncheckedIndexedAccess`. Reduce clases enteras de bugs.
- **Descartado:** JS — inviable para un dominio con tantas entidades y validaciones.

### NativeWind + Tailwind (preset compartido)
- **Por qué:** el diseño aprobado **ya está en Tailwind con tokens**. Se extrae a un preset (`packages/config`) → NativeWind (móvil) y Tailwind (web) consumen los **mismos** tokens. Design system de un solo origen.
- **Descartado:** StyleSheet/CSS-in-JS separados (duplicaría tokens y rompería consistencia ya lograda).

## 2.2 Backend

### Supabase
- **Por qué:** Postgres gestionado + Auth + Storage + Edge Functions + RLS + Realtime en una plataforma; ideal para equipo pequeño que necesita seguridad por fila y storage de imágenes sin construir infraestructura. **Datos en Postgres estándar → sin lock-in** (se puede exportar/migrar).
- **Descartado:** Firebase (NoSQL peor para el modelo relacional de Woven: prendas↔outfits↔viajes↔colecciones con M:N; y menos control SQL/RLS). Backend propio (Node/Nest) — más control pero mucho más coste operativo sin beneficio para el MVP (ADR-001).

### PostgreSQL (+ pgvector)
- **Por qué:** modelo fuertemente relacional (M:N garment↔collection, garment↔outfit vía outfit_item, trip↔garment). `pgvector` habilita **búsqueda semántica** de Inventory con embeddings sin otra base de datos.
- **Descartado:** base vectorial dedicada (Pinecone/Weaviate) — innecesaria a esta escala; añade otro sistema que sincronizar (ADR-006).

### Edge Functions (Deno)
- **Por qué:** ejecutar lógica con **secretos** (IA/clima/recorte), aplicar **rate-limits**, orquestar procesado en lote (Burst/Import), y mantener **idempotencia**. TypeScript/Deno = mismo lenguaje que el resto.
- **Descartado:** llamar a terceros desde el cliente (expondría claves, imposible limitar abuso).

## 2.3 Estado

### TanStack Query
- **Por qué:** estado **de servidor** (prendas, outfits, viajes, colecciones): caché, revalidación, reintentos, **optimistic updates**, **persistencia offline** del caché, invalidación por claves. Es la columna vertebral del offline-first.
- **Descartado:** Redux Toolkit Query (más ceremonia; TanStack tiene mejor DX offline/optimistic y es agnóstico de framework).

### Zustand
- **Por qué:** estado **de cliente/efímero**: borrador del lienzo del Studio, filtros/modo de vista de Inventory, cola offline, flags de UI. Mínimo boilerplate, selectors, persist middleware.
- **Descartado:** Context+useReducer global (re-renders y verbosidad); Redux (excesivo para estado de UI).

> Regla anti-solape (detalle en `06`): **servidor→TanStack Query**, **UI/efímero→Zustand**, **preferencias persistentes→Storage**. Nunca duplicar datos de servidor en Zustand.

## 2.4 IA

> El PRD marcó proveedores como `PD-05`. Aquí se proponen elecciones **desacopladas tras interfaz** (`AiService`), reversibles por ADR-007.

- **Modelo LLM/visión (clasificación, embeddings de texto, razonamiento de recomendación):** **OpenAI** (propuesto por el usuario) — modelos multimodales maduros y APIs estables para clasificación y embeddings. Se accede **solo desde Edge Functions**.
- **Eliminación de fondo:** modelo de **segmentación especializado** (no LLM). Opciones: servicio gestionado (p. ej. remove.bg-like) o modelo self-host (rembg/U²-Net). ⛔ **PD-05** proveedor final; interfaz `BackgroundRemovalService` fija el contrato.
- **Embeddings de imagen para búsqueda semántica:** modelo de embeddings multimodal; almacenados en `pgvector`. Proveedor `PD-05`.
- **Por qué desacoplar:** coste/latencia/calidad varían por proveedor; la interfaz permite A/B y cambio sin tocar clientes.

## 2.5 Storage

### Supabase Storage
- **Por qué:** buckets privados integrados con RLS/Auth; URLs firmadas de vida corta; CDN; genera derivados (thumbnails). Cohesión con el resto de Supabase.
- **Descartado:** S3 directo (más plomería de auth/firmas; sin integración RLS nativa).

## 2.6 Analytics — PostHog
- **Por qué:** eventos de producto + funnels + feature flags + session replay (web). Instrumenta los KPIs del PRD §2.3. Self-host posible (privacidad). Feature flags reutilizables para el gating de Premium (`PD-02`) sin acoplar código.
- **Descartado:** Google Analytics (débil para producto/eventos de app y funnels).

## 2.7 Crash reporting — Sentry
- **Por qué:** errores + trazas de rendimiento en RN y web, con release health (crash-free sessions, KPI del PRD). Source maps/symbolication.
- **Descartado:** Crashlytics (atado a Firebase; peor en web/TS unificado).

## 2.8 Testing
- **Vitest** — unitarios/integración de dominio y hooks (rápido, ESM, compatible con el monorepo TS).
- **Playwright** — E2E web + visual regression (screenshots) multiplataforma.
- **Detox** (o **Maestro**) — E2E móvil sobre build real (flujos críticos, incluido drag táctil del Studio). ⛔ **PD** elección Detox vs Maestro (ADR-011).
- **Descartado:** Jest como runner principal (Vitest más rápido y mejor ESM en monorepo); Cypress (Playwright cubre web + mejor multi-browser).

## 2.9 Tabla resumen

| Área | Elección | Alternativa descartada | ADR |
|---|---|---|---|
| Móvil | React Native + Expo (EAS) | RN bare, Flutter | ADR-003 |
| Web | React + Vite | Next.js (diferido) | ADR-002 |
| Routing | Expo Router | React Navigation manual | ADR-003 |
| Lenguaje | TypeScript estricto | JS | — |
| Estilos | NativeWind + Tailwind preset | StyleSheet/CSS-in-JS | ADR-004 |
| Backend | Supabase | Firebase, backend propio | ADR-001 |
| DB | PostgreSQL + pgvector | NoSQL, DB vectorial dedicada | ADR-006 |
| Server logic | Edge Functions (Deno) | lógica en cliente | ADR-005 |
| Estado servidor | TanStack Query | RTK Query | ADR-008 |
| Estado UI | Zustand | Redux, Context global | ADR-008 |
| IA | OpenAI + segmentación (tras interfaz) | acoplar proveedor | ADR-007 |
| Storage | Supabase Storage | S3 directo | ADR-001 |
| Analytics | PostHog | GA | ADR-015 |
| Crash | Sentry | Crashlytics | ADR-015 |
| Test | Vitest + Playwright + Detox/Maestro | Jest/Cypress | ADR-011 |
| Monorepo | pnpm + Turborepo | Nx, Yarn workspaces | ADR-009 |
