# @woven/config

Configuración de tooling compartida del monorepo (T-0002). **No contiene lógica de negocio.**

## Contenido

- `tsconfig.base.json` — base TypeScript estricta (extiéndela en cada paquete).
- `eslint.config.mjs` — ESLint flat config con **boundaries** de dependencia (ADR-013).
- `prettier.config.mjs` — formato.

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
