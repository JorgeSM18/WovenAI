# 07 · Git · DoD · Checklist · Prohibiciones

## 15. Git

### 15.1 Ramas
- `main` protegida (siempre desplegable). Nada de commits directos.
- Ramas por tarea con el ID del backlog:
  - `feat/T-0406-capture-review-form`
  - `fix/T-0507-favorite-optimistic`
  - `chore/T-0002-eslint-boundaries`
- Prefijos: `feat/ fix/ chore/ refactor/ test/ docs/ perf/`. Rama corta y enfocada (una tarea).

### 15.2 Commits (Conventional Commits)
```
<tipo>(<scope>): <resumen imperativo>   (<= 72 chars)

[cuerpo opcional: por qué, no qué]
Refs: T-0406
```
- Tipos: `feat, fix, chore, refactor, test, docs, perf, ci`.
- Scope = paquete/área (`ui`, `data`, `capture`, `db`).
- Commits atómicos y verdes (compilan/pasan). **Prohibido** "wip" en `main`.
- **Prohibido** `--no-verify`, saltarse hooks o firmar/omitir checks sin permiso humano.

### 15.3 Pull Requests
- Una PR = una tarea (ID en el título). Pequeña y revisable (< ~400 líneas netas cuando sea posible).
- Descripción: qué, por qué, cómo probar, capturas si hay UI, riesgos, IDs (`T-…`, `PD-…`, `ADR-…`).
- Debe pasar CI (lint, typecheck, format, boundaries, tests, visual, a11y) antes de pedir review.
- **Prohibido** mergear con checks en rojo o sin aprobación de un par humano.

### 15.4 Code review
- Revisa: reutilización (¿duplica algo?), arquitectura (¿respeta límites?), tokens/a11y, tests, seguridad, nombres.
- Un agente puede abrir PRs y responder revisiones, pero **el merge lo autoriza un humano**.

### 15.5 Versionado
- SemVer para paquetes publicables (si aplica). Cambios de contrato de API/BD documentados (ADR si es arquitectónico).

## 16. Definition of Done

Una tarea **no está terminada** hasta cumplir **todo**:
- [ ] **Lint/format/typecheck/boundaries** verdes.
- [ ] **Tests** (unit/integración según aplique, y E2E si es flujo crítico) escritos y verdes en CI.
- [ ] **Accesibilidad** WCAG 2.2 AA verificada (si toca UI): alt/labels/roles/foco/contraste/target/reduced-motion.
- [ ] **Responsive** verificado (móvil/tablet/web según superficie).
- [ ] **Dark mode** correcto (tokens, sin colores por tema hardcodeados).
- [ ] **Rendimiento**: listas virtualizadas, imágenes con derivados, sin re-renders evidentes, dentro de objetivos.
- [ ] **Documentación** actualizada si cambia contrato/API/decisión (y ADR si es arquitectónico).
- [ ] Criterios de aceptación cumplidos; sin bugs P0/P1; revisado por un humano; desplegado a `staging`.
- [ ] Áreas `PD` marcadas como stub, no asumidas.

## 17. Checklist obligatoria (responder antes de cerrar cualquier tarea)

El agente **debe** responder explícitamente. Si **alguna** es "No", la tarea **no está terminada**.

**Antes de codificar**
1. ¿He buscado si ya existe una solución/componente/hook/tipo similar? (regla cero)
2. ¿Voy a reutilizar/extender en vez de duplicar?
3. ¿Sé exactamente en qué paquete/carpeta va según la estructura?
4. ¿Respeta la regla de dependencias (dominio no toca infra; ui no toca datos)?
5. ¿La tarea toca un área `PD`? → si sí, stub + parar ahí.

**Antes de cerrar**
6. ¿He reutilizado componentes (no dupliqué)?
7. ¿Añadí tests (unit/integración; e2e si crítico)?
8. ¿Cumple accesibilidad (alt, labels, roles, teclado, foco, contraste)?
9. ¿Respeta el Design System (tokens; cero colores/tamaños hardcodeados; nada visual fuera de `packages/ui`)?
10. ¿Respeta la arquitectura y los límites de dependencia?
11. ¿Pasa lint/typecheck/format/boundaries y los tests en verde?
12. ¿Funciona responsive y en dark mode?
13. ¿Actualicé la documentación/tipos generados si cambió un contrato?
14. ¿Evité `any`, casts inseguros, secretos, y accesos directos a Supabase desde UI?

## 18. Qué NUNCA debe hacer una IA (sin aprobación humana explícita)

- **Duplicar** componentes, hooks, tipos o lógica que ya existen.
- **Repetir lógica** en vez de extraer a `core/usecases` o a un hook/util.
- **Hardcodear** colores, tamaños, tipografías o radios (usar tokens).
- **Crear componentes visuales fuera de `packages/ui`** / del Design System.
- **Acceder a Supabase directamente desde presentación/UI** (saltarse repositorios/hooks).
- **Romper la regla de dependencias** (que `core` importe framework/infra; que `ui` importe `data`).
- **Romper APIs públicas** de un paquete sin migrar a todos los consumidores y documentarlo.
- **Modificar migraciones antiguas** ya aplicadas (crear una nueva).
- **Desactivar/omitir RLS**, subir `.env`, exponer/loguear claves o usar `service_role` en cliente.
- **Eliminar, saltar (`skip`) o debilitar tests** para "pasar" CI; ni bajar cobertura para cumplir.
- **Usar `any`, casts inseguros, `@ts-ignore`** sin justificación y ticket.
- **Añadir dependencias** sin justificar por qué no basta stdlib/plataforma/lo instalado (y sin aprobación).
- **Cambiar la arquitectura o el stack** (estado, routing, backend, design system) sin ADR aprobado.
- **Llamar a terceros/IA desde el cliente** en vez de Edge Functions.
- **Inventar comportamiento** en áreas `PD` (marcar pendiente, no asumir).
- **Mergear** con checks en rojo, sin review humana, o con `--no-verify`.
- **Reformatear/renombrar masivamente** archivos ajenos a la tarea (ruido en el diff).
- **Reproducir/incluir** secretos, datos personales reales o contenido con copyright en el repo.

> Si el agente cree que necesita hacer algo de esta lista, **para y pregunta**: propone la opción, explica por qué, y espera aprobación humana (normalmente vía ADR).
