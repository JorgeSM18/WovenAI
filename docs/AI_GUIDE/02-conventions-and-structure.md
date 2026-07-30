# 02 · Convenciones y estructura

## 2. Convenciones de nombres

### 2.1 Archivos
| Tipo | Convención | Ejemplo |
|---|---|---|
| Componente React | `PascalCase.tsx` | `GarmentCard.tsx` |
| Hook | `useCamelCase.ts` | `useGarments.ts` |
| Contexto | `PascalCaseContext.tsx` | `AuthContext.tsx` |
| Provider | `PascalCaseProvider.tsx` | `ThemeProvider.tsx` |
| Servicio (impl.) | `PascalCaseService.ts` | `SupabaseGarmentRepository.ts` |
| Interfaz/port | `PascalCase.ts` | `GarmentRepository.ts` |
| Tipos/entidades | `PascalCase.ts` | `Garment.ts` |
| Esquema Zod | `camelCase.schema.ts` | `garment.schema.ts` |
| Util puro | `camelCase.ts` | `formatDate.ts` |
| Test | `*.test.ts(x)` junto al archivo | `GarmentCard.test.tsx` |
| Story | `*.stories.tsx` | `Button.stories.tsx` |
| Edge Function | `kebab-case/index.ts` | `remove-background/index.ts` |
| Migración SQL | `NNNN_snake_case.sql` | `0005_garment.sql` |
| Ruta Expo Router | `kebab-case` / `[param].tsx` | `inventory/[garmentId].tsx` |

### 2.2 Símbolos en código
| Símbolo | Convención | Ejemplo |
|---|---|---|
| Componente | PascalCase | `function GarmentCard()` |
| Hook | `use` + camelCase | `useStudioController()` |
| Variable / función | camelCase | `const primaryColor`, `mapGarment()` |
| Constante global | UPPER_SNAKE_CASE | `const MAX_UPLOAD_BYTES` |
| Tipo / interfaz | PascalCase, **sin prefijo `I`** | `type Garment`, `interface GarmentRepository` |
| Enum (TS) | PascalCase nombre, PascalCase miembros | `enum GarmentStatus { Processing }` |
| Genérico | `T`/`TX` descriptivo | `<TItem>` |
| Booleano | prefijo `is/has/should/can` | `isFavorite`, `hasCompletedOnboarding` |
| Handler | prefijo `on`/`handle` | `onPress`, `handleSubmit` |
| Columna/tabla SQL | snake_case | `is_favorite`, `trip_day` |
| Query key | array en `queryKeys` factory | `queryKeys.garments.list(q)` |
| Evento telemetría | snake_case verbo pasado | `garment_captured` |

### 2.3 Reglas transversales de nombres
- **Sin abreviaturas crípticas** (`btn`, `usr`, `img2`). Nombres que se leen como el dominio (`garment`, `outfit`, `trip`).
- **Un concepto, un nombre.** No mezclar `wardrobe`/`closet`/`catalog` para lo mismo: la prenda es `garment`, el armario es `inventory`. Taxonomía de negocio = PRD.
- **Sin sufijos de tipo redundantes** en variables (`garmentObject`, `dataArray`).
- Nombres **en inglés** en el código (identificadores, comentarios técnicos); textos de UI vía i18n.

## 3. Estructura del proyecto — dónde vive cada cosa

Basada en el monorepo del TAD §3. **Regla de oro de dependencias:** `presentation → application → domain`; `domain` no importa framework/infra.

### 3.1 Mapa de ubicación
| Si vas a crear… | Va en… |
|---|---|
| Entidad/tipo de dominio | `packages/core/entities` |
| Esquema de validación Zod | `packages/core/schemas` |
| Regla pura (sin I/O) | `packages/core/usecases` |
| Interfaz de repositorio/servicio (port) | `packages/core/ports` |
| Implementación Supabase de un repo | `packages/data/repositories` |
| Hook de datos (TanStack Query) | `packages/data/queries` |
| Cliente Supabase / invocador Edge | `packages/api` |
| Tipos generados de la BD | `packages/api/generated` (no editar a mano) |
| Store Zustand (UI/efímero) | `packages/store` |
| Componente reutilizable (design system) | `packages/ui/{atoms,molecules,organisms,templates}` |
| Token/preset de estilo | `packages/config` |
| Componente específico de una pantalla | `apps/*/.../<feature>/components` |
| Pantalla/ruta | `apps/*/app/...` (Expo Router) |
| Migración/RLS/función SQL | `supabase/migrations` |
| Edge Function | `supabase/functions/<name>` |
| Prompt de IA | `supabase/functions/<fn>/prompts.ts` |

### 3.2 Permitido / Prohibido (con ejemplos)

✅ **Permitido**
```ts
// apps/mobile/.../inventory/InventoryScreen.tsx
import { InventoryGrid } from '@woven/ui';
import { useGarments } from '@woven/data';       // hook de datos
```
❌ **Prohibido: acceder a Supabase desde presentación/UI**
```ts
// ❌ en un componente
import { supabase } from '@woven/api';
const { data } = await supabase.from('garment').select(); // NO
```
> Los datos se obtienen SIEMPRE por un hook de `packages/data`. Un componente de `packages/ui` ni siquiera importa `data`.

❌ **Prohibido: que `packages/core` importe framework/infra**
```ts
// ❌ packages/core/usecases/forgottenPieces.ts
import { supabase } from '@woven/api'; // NO: core es puro
import { View } from 'react-native';   // NO
```
✅ `core` recibe datos ya cargados y devuelve resultados puros:
```ts
export function forgottenPieces(garments: Garment[], days = 60): Garment[] { /* puro */ }
```

❌ **Prohibido: que `packages/ui` acceda a datos/estado global**
```ts
// ❌ packages/ui/molecules/GarmentCard.tsx
import { useGarments } from '@woven/data'; // NO: ui recibe props
```
✅ `ui` solo recibe props y callbacks:
```ts
export function GarmentCard({ garment, onToggleFavorite }: GarmentCardProps) { /* presentacional */ }
```

### 3.3 Aliases de import
- Usar aliases de paquete (`@woven/core`, `@woven/ui`, `@woven/data`, `@woven/api`, `@woven/store`, `@woven/config`).
- **Prohibido** `../../../..`: si aparece, el archivo está en el sitio equivocado o falta un alias.
- **Prohibido** importar de `apps/*` desde `packages/*` (las apps dependen de packages, nunca al revés).

### 3.4 Un archivo, una responsabilidad
- Un componente por archivo (más sus subcomponentes privados si son triviales).
- Un hook por archivo. Un repositorio por entidad.
- Si un archivo supera ~200–250 líneas o mezcla responsabilidades, dividir.

### 3.5 Barrels (`index.ts`)
- Permitidos por carpeta de `packages/*` para exponer API pública del paquete.
- **No** crear barrels que reexporten todo indiscriminadamente (rompen tree-shaking). Exportar lo que es API pública, no lo interno.
