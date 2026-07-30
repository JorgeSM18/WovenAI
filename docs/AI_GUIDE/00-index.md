# Woven — AI Development Guide

> **Referencia obligatoria para cualquier agente de IA** (Claude Code, Codex, Cursor, Copilot…) que escriba código en Woven. No es un documento funcional ni de arquitectura: es el **contrato de reglas de desarrollo**. Su meta: que el código sea **indistinguible del de un Staff Engineer** y **consistente** sea cual sea el agente.

Complementa (no repite) el PRD (`docs/PRD/`) y el TAD (`docs/ARCHITECTURE/`). Ante conflicto: TAD manda en arquitectura, este guide manda en estilo/proceso.

## Regla cero

**Leer antes de escribir.** Antes de crear cualquier archivo, el agente busca si ya existe algo equivalente (componente, hook, tipo, util, repositorio). Reutilizar > crear. Si crea algo nuevo, justifica por qué no encajaba lo existente.

## Documentos

| # | Archivo | Cubre |
|---|---|---|
| 00 | `00-index.md` | Índice, regla cero, cómo usarlo |
| 01 | `01-philosophy.md` | §1 Filosofía, principios, valores |
| 02 | `02-conventions-and-structure.md` | §2 Convenciones de nombres · §3 Estructura (permitido/prohibido) |
| 03 | `03-react-and-typescript.md` | §4 React · §5 TypeScript |
| 04 | `04-state-components-ui-a11y.md` | §6 Estado · §7 Componentes (Atomic) · §8 UI/tokens · §9 Accesibilidad |
| 05 | `05-performance-and-testing.md` | §10 Rendimiento · §11 Testing |
| 06 | `06-database-ai-security.md` | §12 Base de datos · §13 IA · §14 Seguridad |
| 07 | `07-git-dod-checklist-forbidden.md` | §15 Git · §16 DoD · §17 Checklist · §18 Prohibiciones |
| 08 | `08-agent-base-prompt.md` | §19 Prompt base copiable |

Además, en la **raíz del repo**: `CLAUDE.md` (y `AGENTS.md`) con el resumen ejecutivo de estas reglas, cargado automáticamente por los agentes.

## Cómo lo usa un agente

1. Al iniciar sesión, carga `CLAUDE.md` (auto) y, si la tarea es no trivial, consulta el documento relevante de este guide.
2. Antes de codificar: aplica la **regla cero** (buscar existente) y la **checklist previa** (§17).
3. Al terminar: pasa la **checklist de calidad** (§17) y la **DoD** (§16). Si algo es "No", la tarea **no está terminada**.
4. Nunca hace algo de la lista de **prohibiciones** (§18) sin aprobación humana explícita.

## Estabilidad

Este documento está pensado para durar años. Cambios a las reglas requieren: PR + revisión humana + un ADR en `docs/ARCHITECTURE/12-scalability-risks-adr.md`. Ningún agente cambia las reglas por iniciativa propia.
