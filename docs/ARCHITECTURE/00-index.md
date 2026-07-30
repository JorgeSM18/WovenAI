# Woven — Documento de Arquitectura Técnica (TAD)

> Referencia de arquitectura para **todos** los desarrolladores. Complementa y no contradice el PRD (`docs/PRD/`). Donde el PRD marcó `⛔ PD-xx`, aquí se propone la solución técnica **desacoplada tras una interfaz**, dejando la elección de negocio/proveedor pendiente cuando aplique.

## Control documental

| Campo | Valor |
|---|---|
| Documento | Technical Architecture Document (TAD) v1.0 |
| Autor (rol) | Staff Software Engineer — arquitectura móvil + web |
| Base | PRD Woven v1.0 (diseño aprobado: 7 pantallas + `design/woven/DESIGN.md`) |
| Alcance | MVP + preparación para escala; sin diseñar funcionalidades nuevas |

## Principios de arquitectura (guían toda decisión)

1. **Escalable** — sin reescrituras entre 100 y 10M usuarios; los cambios de escala son operativos/infra, no de arquitectura de dominio.
2. **Mantenible** — límites de módulo explícitos, dependencias en una sola dirección, tipado end-to-end.
3. **Modular** — dominio, datos, UI y estado separados en paquetes independientes.
4. **Testeable** — lógica pura sin dependencias de framework; efectos aislados tras interfaces (repositorios/servicios).
5. **Offline-first** cuando sea posible — lectura desde caché, escritura con cola y reconciliación.
6. **Máximo código compartido Web/Mobile** — un solo dominio, un solo cliente de datos, un solo estado; solo la capa de presentación diverge lo imprescindible.
7. **Seguro por defecto** — RLS en todas las tablas; claves solo en servidor; imágenes privadas.

## Regla de oro de dependencias

```
presentation → application(hooks/services) → domain(core)      (nunca al revés)
              ↘ data(repositories) → infra(supabase/ai/storage)
```
`domain` **no** importa React, Supabase ni nada de infraestructura. La infraestructura implementa interfaces definidas en `domain`.

## Entregables

| # | Archivo | Secciones |
|---|---|---|
| 00 | `00-index.md` | Índice, principios, control |
| 01 | `01-general-architecture.md` | §1 Arquitectura general (alto nivel, capas, front, back, comunicación) |
| 02 | `02-tech-stack.md` | §2 Stack tecnológico justificado |
| 03 | `03-monorepo.md` | §3 Monorepo |
| 04 | `04-components-architecture.md` | §4 Componentes, hooks, contexts, providers, services, repositories |
| 05 | `05-navigation.md` | §5 Navegación mobile/web/tablet |
| 06 | `06-state-management.md` | §6 Gestión del estado |
| 07 | `07-data-model-and-database.md` | §7 Modelo de datos · §8 PostgreSQL (DDL, índices, RLS, triggers, funciones, migraciones, seeds) |
| 08 | `08-api.md` | §9 API (REST/RPC/Edge/eventos/webhooks) |
| 09 | `09-images-and-ai.md` | §10 Procesamiento de imágenes · §11 Arquitectura IA |
| 10 | `10-offline-security-performance.md` | §12 Offline · §13 Seguridad · §14 Rendimiento |
| 11 | `11-observability-testing-cicd.md` | §15 Observabilidad · §16 Testing · §17 CI/CD |
| 12 | `12-scalability-risks-adr.md` | §18 Escalabilidad · §19 Riesgos · §20 ADRs |

## Cómo leer este documento

- Empezar por `01` (mapa mental) → `03` (dónde vive el código) → `06` (dónde vive el estado) → `07` (datos).
- Antes de tocar una tabla, leer su RLS en `07` y su acceso en `08`.
- Toda decisión relevante tiene su **ADR** en `12` (formato Problema/Opciones/Decisión/Justificación/Consecuencias).
