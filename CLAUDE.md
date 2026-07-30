# CLAUDE.md — Reglas de desarrollo de Woven (lectura obligatoria para agentes)

Woven = armario digital con IA (Expo/RN móvil + React/Vite web + Supabase). Este archivo se
carga automáticamente. Es el **resumen operativo**; la referencia completa es `docs/AI_GUIDE/`
(y `docs/PRD/`, `docs/ARCHITECTURE/`). Ante conflicto: TAD manda en arquitectura, AI_GUIDE en estilo.

## Stack (no cambiar sin ADR aprobado por un humano)
Monorepo pnpm+Turborepo · Expo/React Native (móvil, Expo Router) · React+Vite (web) · TypeScript estricto ·
Supabase (Postgres + RLS + Storage + Edge Functions) · TanStack Query + Zustand · NativeWind/Tailwind (DS Woven).

## Regla cero (Golden Rule)
**Leer antes de escribir.** Busca si ya existe (componente/hook/tipo/util/repo) y **reutiliza/extiende**
antes de crear. Duplicar es un defecto. Ante la duda crear vs reutilizar, **reutiliza** y propón refactor solo
si aporta beneficio claro. Trabaja en el **diff más pequeño** que cumpla la tarea + sus tests.

## Arquitectura
- Dependencias: `presentation → application(hooks) → domain(core)`. `packages/core` NO importa React/Supabase/infra.
- `packages/ui` NO importa `data`/`api`/`store` (recibe props). **Datos solo por hooks de `packages/data`.**
- **PROHIBIDO** usar `supabase-js` desde UI/pantallas. Efectos con secretos/terceros/IA → **Edge Functions**, nunca cliente.
- Atomic Design · Feature-first · Services + Hooks + UI separados · componentes puros siempre que se pueda.

## Estado (sin solapes)
servidor→**TanStack Query** (queryKeys factory, optimistic+rollback) · UI/efímero→**Zustand** (selectors) ·
preferencias→**Storage(+User)** · local→`useState`. **Nunca** copiar datos de servidor a Zustand.

## TypeScript
`strict`. **Nunca `any`**, casts inseguros ni `@ts-ignore` sin justificar+ticket. Uniones de literales sobre `enum`
en dominio. **Validar toda entrada externa con Zod** en la frontera. Tipos de BD generados; mapear a dominio en repos.

## UI / Design System (Woven)
- **PROHIBIDO** colores/tamaños/tipografías hardcodeados y crear visuales fuera de `packages/ui`.
- Usar **tokens**: `bg-primary`, `text-on-surface`, `p-md`, `gap-sm`, `rounded-xl`, `text-headline-md`. Dark mode por tokens.
- Tipografía única **Hanken Grotesk**; `primary #000000`; iconos Material Symbols válidos (`auto_fix_high`, no `auto_fix`).
- Variantes por prop, no por copia. Reutilizar siempre el Design System.

## Accesibilidad (WCAG 2.2 AA, por componente)
`alt` real (**nunca `data-alt`**), labels, roles, teclado, `focus-visible`, contraste AA, target ≥44px,
`prefers-reduced-motion`, **sin** `user-scalable=no`, alternativa accesible al drag.

## Rendimiento
Listas **virtualizadas** (FlashList) + **keyset** (no offset); memoiza items de lista; imágenes con **derivados**
(thumbnail en listas, no full) y **optimizadas/comprimidas antes de subir**; no optimices sin medir; no añadas
dependencias pesadas por pocas líneas.

## Tests (obligatorio)
No se acepta lógica nueva sin tests (unit/integración; e2e si es flujo crítico), **junto al código**, deterministas
(mockea IA/clima tras su interfaz). **Nunca** borrar/skippear tests ni bajar cobertura para pasar CI.

## Base de datos
Migraciones **forward-only** (**NUNCA editar/modificar una existente**). **RLS obligatoria** en toda tabla nueva +
test de aislamiento. `snake_case`; keyset; CRUD por repositorios, lógica compleja por **RPC**. Regenerar tipos tras migrar.

## IA
Prompts **versionados**; salida **estructurada validada con Zod** (nada de parsear texto); **caché** (recorte por hash,
embeddings persistidos, clima por location/date); **fallbacks** (un fallo de IA nunca bloquea al usuario); retries con
backoff; **instrumentar coste**.

## Seguridad
Nunca secretos en repo/cliente/logs; claves solo en Edge; **validar en cliente Y servidor**; buckets privados + URLs
firmadas; mínimo privilegio; **nunca** desactivar RLS ni usar `service_role` en cliente.

## Info faltante (`PD`)
Si algo es **Pendiente de Definición** en el PRD, **no lo inventes**: deja stub documentado y **detente** en esa parte.

## Git
Rama por tarea `feat/T-XXXX-...`; **Conventional Commits** con `Refs: T-XXXX`; PR pequeña que pasa CI
(lint+typecheck+format+boundaries+tests+visual+a11y) y **explica las decisiones importantes**.
**El merge lo autoriza un humano.** Nunca `--no-verify`.

## Antes de terminar cualquier tarea
Ejecutar `pnpm lint` · `pnpm typecheck` · `pnpm test` (verdes) y verificar **responsive**, **dark mode** y **accesibilidad**.
Luego responder la checklist (si alguna es "No", NO está terminada):
1) ¿reutilicé (no dupliqué)? 2) ¿tests? 3) ¿accesibilidad AA? 4) ¿Design System/tokens? 5) ¿arquitectura/límites?
6) ¿lint+typecheck+format+tests verdes? 7) ¿responsive + dark mode? 8) ¿doc/tipos actualizados?
9) ¿evité any/casts/secretos/acceso directo a Supabase desde UI?

## NUNCA (sin aprobación humana / ADR)
Duplicar código · hardcodear estilos · crear UI fuera del DS · acceder a Supabase desde UI · romper límites de
dependencia o APIs públicas · editar migraciones antiguas · desactivar RLS · exponer/loguear secretos · borrar/skippear
tests · usar `any`/casts inseguros · añadir dependencias injustificadas · cambiar stack/arquitectura · llamar a IA desde
el cliente · inventar en áreas `PD` · reformatear masivamente archivos ajenos · mergear con checks en rojo o sin review.

> Si necesitas hacer algo de la lista **NUNCA**, para y pregunta con una propuesta. Detalle completo en `docs/AI_GUIDE/`.
