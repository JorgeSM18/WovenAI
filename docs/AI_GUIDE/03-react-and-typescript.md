# 03 · React y TypeScript

## 4. React

### 4.1 Componentes
- **Solo funciones + hooks.** Nada de clases (salvo `ErrorBoundary` si el runtime lo exige).
- Props tipadas con `type Props`; desestructurar en la firma.
- Componentes **puros y presentacionales** en `packages/ui`; la lógica de datos vive en hooks de `packages/data` o en controllers de la app.
- Export **nombrado** (no `export default`) salvo cuando el router lo exija (rutas Expo Router pueden requerir default).
```tsx
type GarmentCardProps = {
  garment: Garment;
  onToggleFavorite: (id: string) => void;
};
export function GarmentCard({ garment, onToggleFavorite }: GarmentCardProps) {
  return (/* ... solo presentación, tokens del DS ... */);
}
```
- **Early returns** para estados (loading/empty/error) antes del render principal.
- Nada de lógica de negocio en el JSX; extraer a `usecases`/hooks.

### 4.2 Hooks
- Reglas de hooks siempre (nivel superior, orden estable).
- Un hook = una responsabilidad. Tres familias (TAD §04): **query hooks** (`data`), **use-case hooks** (`core`), **controller hooks** (`apps`).
- Custom hooks para lógica reutilizable; **no** duplicar `useEffect` de fetch en componentes (eso es TanStack Query).
- `useEffect` solo para efectos reales (suscripciones, sync con sistemas externos). **No** usar `useEffect` para derivar estado (derivar en render o `useMemo`).

### 4.3 Layouts / Providers / Pantallas
- Layouts y providers según TAD §04.5 (orden: Sentry→Query→Auth→Theme→Telemetry).
- Pantallas = **composición** de organisms + hooks; sin estilos ad-hoc (usar templates/tokens).
- Una pantalla no llama a Supabase ni arma queries; consume hooks.

### 4.4 Formularios
- Validación con **Zod** (esquemas en `core/schemas`), integrada con el formulario (React Hook Form recomendado; ⛔ confirmar en primer uso, sin añadir otra lib de formularios después).
- Campos obligatorios y errores explícitos (Captura: Category/Color; Trip: fechas).
- Estados: `idle/validating/submitting/error/success`. Botón de submit deshabilitado mientras `submitting`.
- Validar en cliente **y** en servidor (nunca confiar solo en cliente, §14).

### 4.5 Renderizado
- Listas con `key` estable (id de dominio, **nunca el índice**).
- Estados de UI siempre cubiertos: **loading (skeleton), empty, error, success**. Ningún componente asume "siempre hay datos".
- Nada de lógica cara en render; memorizar (§4.6) o mover a `usecases`.

### 4.6 Memoización y optimización
- Memoizar **con criterio**, no por defecto: `React.memo` en items de listas grandes (`GarmentCard`) y componentes del lienzo del Studio; `useMemo`/`useCallback` cuando se pasan a hijos memoizados o hay cálculo real.
- **No** envolver todo en `useCallback`/`useMemo` "por si acaso" (ruido y coste). Medir antes de optimizar (principio 5).
- Selectores de Zustand para suscribirse solo a lo necesario (evita re-renders globales).
- Ver rendimiento detallado en §10.

## 5. TypeScript

### 5.1 Configuración y prohibiciones absolutas
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitAny`.
- **Prohibido `any`** (implícito o explícito). Si un tipo es desconocido de verdad, `unknown` + **estrechar con Zod/guards**, nunca propagar `unknown`.
- **Prohibidos los casts inseguros** (`as Foo`, `as unknown as Foo`, `!` non-null salvo prueba local evidente). Usar validación/guards.
- **Prohibido `@ts-ignore`/`@ts-expect-error`** sin comentario justificando y ticket asociado.

### 5.2 `type` vs `interface`
- **`type`** por defecto (uniones, mapeos, props, entidades).
- **`interface`** para **contratos extensibles/implementables**: ports (repositorios/servicios) que tienen implementaciones.
```ts
export interface GarmentRepository { list(q: GarmentQuery): Promise<Garment[]>; }
export type GarmentCardProps = { garment: Garment; onToggleFavorite: (id: string) => void };
```

### 5.3 `enum`, uniones y discriminated unions
- Preferir **uniones de literales** a `enum` en el dominio (mejor tree-shaking, serializan directo, casan con enums de Postgres):
```ts
export type GarmentStatus = 'processing' | 'active' | 'archived';
```
- `enum` TS solo si aporta (agrupación con métodos/iteración). En la BD son enums Postgres; en TS se mapean a uniones de literales.
- **Discriminated unions** para estados/variantes con campo discriminante:
```ts
type RemoteData<T> =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'success'; data: T };
```
- Estrechar siempre por el discriminante (`switch (x.status)`), con caso `default` que fuerce exhaustividad (`assertNever`).

### 5.4 Tipos de datos y fronteras
- Los tipos de la BD se **generan** (`packages/api/generated`) y se **mapean a entidades de dominio** en los repositorios; la UI ve entidades de dominio, no tipos crudos de Supabase.
- Toda entrada externa (respuesta de Edge Function, deep link, formulario) se **valida con Zod** en la frontera; a partir de ahí el tipo es fiable.
- **Prohibido** exponer tipos `Database['public']['Tables'][...]` fuera de `data`/`api`.

### 5.5 Estilo TS
- Nada de `Function`, `object`, `{}` como tipos. Firmas explícitas.
- Retornos explícitos en funciones exportadas.
- `readonly`/`as const` para constantes e inmutables.
- Utilidades de tipo (`Pick`, `Omit`, `Partial`) sobre entidades del dominio en vez de redefinir.
