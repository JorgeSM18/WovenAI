# 06 · Gestión del estado

Principio: **una sola fuente por tipo de estado; sin solapes.** Cada dato vive en exactamente una capa.

## 6.1 Matriz de responsabilidad

| Tipo de estado | Vive en | Ejemplos | NO va en |
|---|---|---|---|
| **Estado de servidor** (persistido en backend) | **TanStack Query** (caché) | prendas, outfits, viajes, colecciones, perfil, recomendaciones IA, clima | Zustand, Context |
| **Estado de UI/efímero** (no persistido en backend) | **Zustand** | borrador del lienzo del Studio, filtros/modo de vista de Inventory (sesión), estado de la cola offline, flags de modales | TanStack Query |
| **Preferencias persistentes** (sobreviven a cierres) | **Storage** (MMKV/AsyncStorage; sincronizadas a `User` en backend cuando aplica) | tema, densidad de vista por defecto, unidades, idioma | Solo en memoria |
| **Estado local de componente** | `useState`/`useReducer` | inputs no confirmados, hover, toggles locales | Store global |
| **Caché de red persistida** | **TanStack Query persister** (offline) | snapshot del caché para arranque offline | — |

## 6.2 TanStack Query — estado de servidor

- **Query keys** centralizadas en `packages/data/queryKeys.ts` (fábrica tipada) para invalidación consistente:
```ts
export const queryKeys = {
  garments: {
    all: ['garments'] as const,
    list: (q: GarmentQuery) => ['garments', 'list', q] as const,
    detail: (id: string) => ['garments', 'detail', id] as const,
  },
  outfits: { all:['outfits'], detail:(id:string)=>['outfits','detail',id] },
  trips:   { all:['trips'],   detail:(id:string)=>['trips','detail',id] },
  collections: { all:['collections'] },
  weather: (tripId:string)=>['weather', tripId],
  search:  (q:string)=>['search', q],
};
```
- **Políticas por entidad** (`staleTime`/`gcTime`): datos estables (colecciones, perfil) `staleTime` alto; búsqueda `staleTime` bajo.
- **Mutaciones optimistas** con rollback (favorito, crear prenda, guardar outfit, mover en Studio, asignar outfit a día).
- **Invalidación**: tras mutación, invalidar las keys afectadas (p. ej. crear prenda → `garments.all`).
- **Persistencia offline**: `persistQueryClient` con storage por plataforma (MMKV móvil / IndexedDB web).

## 6.3 Zustand — estado de UI/efímero

Stores pequeños y enfocados (con selectors para evitar re-renders):

| Store | Contenido | Persistencia |
|---|---|---|
| `useStudioDraft` | items del lienzo (posición/capa/rotación/escala), historial undo/redo, selección | Persistido (recuperar borrador) |
| `useInventoryFilters` | query activa, colección seleccionada, modo de vista | Sesión (modo de vista por defecto → Storage/`User`) |
| `useOfflineQueue` | operaciones pendientes de sync, estado de reintento | Persistido (crítico) |
| `useUiFlags` | modales, toasts, estados transitorios | No persistido |

Regla: **Zustand nunca almacena datos que ya están en TanStack Query.** El borrador del Studio referencia `garmentId`, no copia la prenda.

## 6.4 Storage (persistencia local)

- **Móvil:** `react-native-mmkv` (rápido, síncrono) para preferencias y persistencia de caché/cola.
- **Web:** `localStorage`/IndexedDB.
- **Seguro:** tokens de sesión en `expo-secure-store` (móvil) — nunca en MMKV plano (§13).
- Preferencias también se reflejan en `User` (backend) para sincronizar entre dispositivos.

## 6.5 Cache (capas)

```mermaid
flowchart LR
    UI --> QC[TanStack Query cache in-memory]
    QC --> PERS[Query persister (MMKV/IndexedDB)]
    QC --> NET[Supabase]
    IMG[Imágenes] --> IMGC[Expo Image disk cache]
    IMGC --> CDN[Supabase Storage CDN]
```
- **Datos:** memoria (TanStack) + persistencia offline.
- **Imágenes:** caché en disco (Expo Image) sobre CDN de Storage; derivados (thumbnail/full).
- Invalidación de imágenes por `updated_at`/versión de asset.

## 6.6 Decisiones de límites (anti-solape)

- ¿Viene del backend y se persiste allí? → **TanStack Query**.
- ¿Es UI que se pierde al cerrar (salvo borradores)? → **Zustand**.
- ¿Es preferencia que debe sobrevivir y quizá sincronizarse? → **Storage (+ User)**.
- ¿Solo importa a un componente? → `useState`.

> Antipatrón prohibido: copiar el resultado de una query a un store Zustand "para tenerlo a mano". Provoca desincronización. Usar el hook de query donde se necesite.
