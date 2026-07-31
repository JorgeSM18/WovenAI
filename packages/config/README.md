# @woven/config

Configuración de tooling compartida del monorepo (T-0002). **No contiene lógica de negocio.**

## Contenido

- `tsconfig.base.json` — base TypeScript estricta (extiéndela en cada paquete).
- `eslint.config.mjs` — ESLint flat config con **boundaries** de dependencia (ADR-013).
- `prettier.config.mjs` — formato.
- `vitest.base.ts` — config base de Vitest.
- `tailwind-preset.cjs` — tokens Woven (colores/tipografía/espaciado/radios) para NativeWind (móvil) y Tailwind (web). Fuente: `design/woven/DESIGN.md`.

## Tailwind preset (tokens)

En el `tailwind.config` de cada app:

```js
module.exports = { presets: [require('@woven/config/tailwind-preset')] };
```

Solo se codifican los tokens **light**; los valores dark se cablean con el theme provider (T-0106).

## Uso en un paquete/app

**tsconfig** (`packages/<x>/tsconfig.json`):

```json
{ "extends": "@woven/config/tsconfig.base.json", "include": ["src"] }
```

**ESLint**: la raíz ya expone `eslint.config.mjs` que re-exporta esta config; ESLint (flat config) la resuelve hacia arriba, por lo que los paquetes no necesitan su propia config salvo que quieran extenderla:

```js
export { default } from '@woven/config/eslint';
```

**Prettier**: la raíz re-exporta `@woven/config/prettier`.

## Reglas de boundaries que se aplican

`core` no importa nada interno ni framework · `ui` solo `core`/`config` (sin data/api/store) ·
`data` → `core`/`api`/`config` · `@supabase/supabase-js` solo en `api` · sin imports relativos profundos.
