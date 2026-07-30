# 01 · Arquitectura general

## 1.1 Arquitectura de alto nivel

Woven es un sistema **cliente-servidor offline-first** con dos clientes (móvil y web) que comparten dominio, datos y estado, y un backend gestionado (Supabase) que concentra base de datos, autenticación, almacenamiento de imágenes y lógica de servidor (Edge Functions) que orquesta la IA y terceros.

```mermaid
flowchart TB
    subgraph Clients
      MOB["📱 apps/mobile\nExpo RN + Expo Router"]
      WEB["🖥️ apps/web\nReact + Vite"]
    end
    subgraph Shared["packages (compartido TS)"]
      CORE["core: dominio, tipos, zod, casos de uso"]
      DATA["data: repositorios + TanStack Query"]
      STORE["store: Zustand (UI/efímero)"]
      UI["ui: design system (NativeWind/Tailwind)"]
    end
    MOB --> Shared
    WEB --> Shared
    DATA -->|SDK / HTTPS| SB
    subgraph Backend["Supabase (BaaS)"]
      AUTH["Auth (JWT)"]
      PG[("PostgreSQL + RLS + pgvector")]
      ST["Storage (buckets privados)"]
      EF["Edge Functions (Deno)"]
      RT["Realtime (opcional)"]
    end
    EF --> PG
    EF --> ST
    EF -->|HTTPS| EXT
    subgraph EXT["Terceros (tras interfaz)"]
      AISVC["IA: clasificación / embeddings / recomendación"]
      BG["Eliminación de fondo (segmentación)"]
      WX["Clima"]
    end
    MOB -. Analytics/Crash .-> OBS["PostHog · Sentry"]
    WEB -. Analytics/Crash .-> OBS
```

**Decisiones ancla** (detalle y justificación en `02` y ADRs `12`):
- **BaaS (Supabase)** en lugar de backend propio: reduce superficie operativa (auth, DB, storage, funciones, RLS) para un equipo pequeño; Postgres estándar evita lock-in de datos.
- **La IA y todo tercero se orquestan en Edge Functions**, nunca desde el cliente: protege claves, centraliza rate-limits, permite cambiar de proveedor sin tocar clientes.

## 1.2 Arquitectura por capas

Cuatro capas con dependencia unidireccional (regla de oro, `00`).

```mermaid
flowchart LR
    P["Presentation\n(componentes, pantallas, navegación)"]
    A["Application\n(hooks, casos de uso, services)"]
    D["Domain\n(entidades, tipos, zod, reglas puras, interfaces)"]
    I["Infrastructure\n(repositorios Supabase, storage, IA clients)"]
    P --> A --> D
    A --> I
    I -.implements.-> D
```

| Capa | Responsabilidad | No debe |
|---|---|---|
| **Presentation** | Render, interacción, navegación. React/RN + design system. | Contener reglas de negocio ni llamadas directas a Supabase. |
| **Application** | Orquestación de casos de uso, hooks de datos (TanStack Query), estado de UI (Zustand). | Conocer detalles de SQL/tabla. |
| **Domain** (`packages/core`) | Entidades, tipos, validación (Zod), reglas puras (p. ej. "forgotten > 60 días", "TripDay dentro de rango"), **interfaces de repositorio/servicio**. | Importar React, Supabase, ni nada de infra. |
| **Infrastructure** (`packages/data`) | Implementaciones concretas: repositorios Supabase, cliente Storage, clientes IA/clima (a través de Edge Functions). | Filtrar tipos de Supabase hacia arriba sin mapear a dominio. |

Ventaja: el dominio es **testeable sin backend** y la infraestructura es **reemplazable** (p. ej., migrar de Supabase) sin tocar dominio ni presentación.

## 1.3 Arquitectura Frontend

Idéntica en móvil y web salvo la capa de presentación:

```mermaid
flowchart TB
    subgraph Presentation
      SCR["Screens/Routes (Expo Router / rutas web)"]
      ORG["Organisms/Molecules/Atoms (packages/ui)"]
    end
    subgraph Application
      QH["Query Hooks (packages/data): useGarments, useCreateGarment..."]
      UC["Use-cases (packages/core): createOutfit, validateTrip..."]
      ZS["Zustand stores (packages/store): studioDraft, filters, offlineQueue"]
    end
    subgraph Domain
      ENT["Entities + Zod schemas"]
      REPI["Repository interfaces"]
    end
    subgraph Infra
      REPO["Repositories (Supabase)"]
      OFF["Offline queue + cache persistence"]
    end
    SCR --> ORG --> QH
    QH --> UC --> ENT
    QH --> REPO
    ORG --> ZS
    REPO -.implements.-> REPI
    QH --> OFF
```

- **Presentación fina**: los componentes reciben datos ya moldeados por hooks; no arman queries.
- **Un hook por caso de uso de datos** (`useGarments`, `useCreateGarment`, `useOutfit`, …) — la pantalla no sabe si viene de red o caché.
- **NativeWind (móvil) + Tailwind (web)** comparten el **mismo preset de tokens** (`packages/config`), por lo que el design system es un único origen.

## 1.4 Arquitectura Backend

Supabase como plataforma; la lógica se reparte entre **Postgres (datos + reglas de integridad + RLS)** y **Edge Functions (orquestación de efectos)**.

```mermaid
flowchart TB
    C[Clientes] -->|supabase-js SDK| PGRST["PostgREST (REST auto)"]
    C -->|invoke| EF["Edge Functions (Deno)"]
    C -->|upload/signed URL| ST["Storage"]
    PGRST --> PG[("PostgreSQL")]
    EF --> PG
    EF --> ST
    EF --> AISVC["IA / BG removal / Clima (tras interfaz)"]
    PG -->|triggers/functions| PG
    subgraph Seguridad
      RLS["RLS por auth.uid()"]
    end
    PG --- RLS
```

Reparto de responsabilidad backend:
- **CRUD directo** de entidades del usuario → **PostgREST** (SDK) con **RLS** (sin backend intermedio; menos código, menos latencia).
- **Efectos con secretos o terceros** (recorte de fondo, clasificación, embeddings, recomendación, clima, procesado en lote) → **Edge Functions** (claves seguras, rate-limit, idempotencia).
- **Reglas de integridad** que deben cumplirse siempre (fechas de viaje, capas de outfit, `updated_at`) → **triggers/constraints** en Postgres (no confiables solo en cliente).

## 1.5 Comunicación entre módulos (dentro de un cliente)

- **Presentation ↔ Application**: por **hooks** (`useX`) y **stores** (Zustand selectors). Nunca imports cruzados de infra.
- **Application ↔ Domain**: llamadas a funciones puras y validación con esquemas Zod compartidos.
- **Application ↔ Infrastructure**: solo a través de **interfaces de repositorio** definidas en `domain`; la implementación concreta (Supabase) se inyecta.
- **Prohibido**: que un componente importe `supabase-js` directamente. Lint rule que lo bloquea (ADR-013).

```mermaid
flowchart LR
    Comp[Component] -->|useGarments()| Hook
    Hook -->|GarmentRepository| Iface[[interface]]
    Iface -.->|impl| SupaRepo[SupabaseGarmentRepository]
    Comp -->|useStudioDraft()| Zustand
```

## 1.6 Comunicación entre aplicaciones (mobile ↔ web ↔ backend)

- Móvil y web **no se comunican entre sí**; comparten estado a través del **backend** (fuente de verdad remota). La consistencia multi-dispositivo se logra por sincronización (offline `10`), no por canal directo.
- **Realtime (Supabase)**: opcional para MVP. Se puede activar para reflejar cambios entre dispositivos del mismo usuario (p. ej., prenda añadida en el móvil aparece en la web) — ADR-014 lo deja **desactivado por defecto** (polling/refetch en foco basta) y activable sin cambios de arquitectura.
- **Contratos compartidos**: tipos generados de la BD (`supabase gen types`) + esquemas Zod en `packages/core` garantizan que ambos clientes hablan el mismo lenguaje que el backend.

```mermaid
sequenceDiagram
    participant MOB as Móvil
    participant SB as Supabase
    participant WEB as Web
    MOB->>SB: createGarment (optimistic local)
    SB-->>MOB: 201 (row + updated_at)
    Note over WEB: al enfocar / refetch
    WEB->>SB: getGarments (since updated_at)
    SB-->>WEB: nueva prenda
```
