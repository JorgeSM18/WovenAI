# Woven — Plan de Implementación (Delivery Plan)

> Roadmap técnico profesional. Fuentes: `docs/PRD/` (qué) + `docs/ARCHITECTURE/` (cómo) + diseño aprobado (7 pantallas). No introduce funcionalidades nuevas. Las áreas `⛔ PD-xx` del PRD **no se planifican como trabajo estimable** hasta que Producto las resuelva; se listan como bloqueos.

## Cómo está organizado

```
Epic (E##)
 └─ Feature (F-E##-##)
     └─ User Story (US-XXX-##)
         └─ Technical Task (T-####)
             └─ Subtask (T-####.#)
```

Cada elemento lleva: **ID · Título · Descripción · Prioridad · Dependencias · Estimación · Riesgos · Criterios de aceptación (DoD)**.

## Esquema de identificadores (únicos, estables, importables)

| Nivel | Formato | Ejemplo |
|---|---|---|
| Epic | `E` + 2 dígitos | `E04` |
| Feature | `F-E##-##` | `F-E04-02` |
| User Story | `US-<área>-##` (reutiliza IDs del PRD) | `US-CAP-01` |
| Task | `T-` + 4 dígitos | `T-0412` |
| Subtask | `T-####.#` | `T-0412.2` |
| Sprint | `S#` | `S3` |
| ADR ref | `ADR-###` (del TAD) | `ADR-007` |
| Bloqueo | `PD-##` (del PRD) | `PD-01` |

Los IDs no se reutilizan ni se renumeran. Sirven como clave de importación a Jira/Linear/GitHub Projects/Notion/ClickUp/Trello.

## Estimación (Story Points + talla)

Escala Fibonacci; mapeo a talla:

| SP | Talla | Significado | Regla |
|---|---|---|---|
| 1–2 | **S** | trivial/acotado, sin incógnitas | < ½ día |
| 3 | **M** | estándar, alguna integración | ~1 día |
| 5–8 | **L** | varias piezas, integración real | 2–4 días |
| 13 | **XL** | complejo/incierto → **debe partirse** | dividir antes de sprint |

Justificación: SP capturan complejidad+incertidumbre, no horas; la talla facilita lectura de negocio. Todo XL se divide en la planificación de sprint (no se arranca un XL sin trocear).

## Cadencia y equipo (supuesto)

- **Sprints de 2 semanas.** MVP objetivo en **S0–S10** (~5 meses de build real).
- ⛔ **Supuesto de equipo** (no en PRD, marcado): 2 ing. producto (móvil+web comparten dominio), 1 ing. backend/infra, 1 ing. con foco IA/imagen, 1 diseñador, 1 QA (compartido), 1 EM. Ajustar velocidad si el equipo difiere.
- Velocidad asumida ~30–40 SP/sprint de equipo (se recalibra tras S1).

## Principios del roadmap

1. **Cada sprint entrega algo demostrable** (demo al final).
2. **Vertical slices**: se prioriza tener el bucle E2E fino cuanto antes (capturar→ver en inventario) sobre completar una capa entera.
3. **Testing dentro de cada epic**, nunca al final (§04).
4. **Bloqueos `PD` aislados**: donde un `PD` bloquea UI (p. ej. auth), se construye la capa técnica desacoplada y se stubbea la UI.

## Entregables de este plan

| # | Archivo | Contenido |
|---|---|---|
| 00 | `00-index.md` | IDs, estimación, cadencia, DoD/quality (punteros) |
| 01 | `01-epics-dependencies-parallelization.md` | Epics, features, grafo de dependencias, tracks de paralelización |
| 02 | `02-sprint-plan.md` | Sprint 0→MVP con objetivo/historias/tareas/riesgos/entregables/demo/DoD |
| 03 | `03-backlog.csv` | Backlog plano **importable** (Jira/Linear/GitHub/Notion/ClickUp/Trello) |
| 04 | `04-risks-testing-dod-quality.md` | Riesgos por categoría, testing por epic, DoD, checklist de calidad |
| 05 | `05-release-and-mvp.md` | Alpha/Beta/TestFlight/Play Internal/Closed Beta/Prod + definición de MVP terminado |
| 06 | `06-future-roadmap.md` | v1.1, v1.2, Premium, IA avanzada, Marketplace, Comunidad, Widgets, Watch/WearOS |

## Definition of Done (global, resumen — detalle en §04)

Una tarea está **terminada** solo si: código + tests (unit/integración según aplique) verdes en CI, typecheck/lint/format ok, criterios de aceptación cumplidos, accesibilidad básica verificada (si toca UI), documentada si cambia contrato/API, revisada por ≥1 par, y desplegada a `staging` sin regresiones. Ver checklist obligatoria en `04`.
