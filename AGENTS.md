# AGENTS.md

Reglas de desarrollo para **cualquier** agente de IA (Codex, Cursor, Copilot, Claude Code, etc.).

> **Fuente única:** este proyecto define sus reglas en [`CLAUDE.md`](./CLAUDE.md). Léelo íntegro **antes** de escribir código: es de obligado cumplimiento y no se duplica aquí para evitar divergencias.

Referencia completa:
- Reglas de desarrollo detalladas: [`docs/AI_GUIDE/`](./docs/AI_GUIDE/) (incluye el prompt base en `08-agent-base-prompt.md`).
- Qué construir: [`docs/PRD/`](./docs/PRD/).
- Cómo está construido: [`docs/ARCHITECTURE/`](./docs/ARCHITECTURE/).
- Plan de trabajo e IDs de tareas: [`docs/DELIVERY/`](./docs/DELIVERY/).

Resumen inviolable (detalle en `CLAUDE.md`): reutiliza antes de crear · respeta la regla de dependencias
(dominio no toca infra; UI no toca datos; datos solo por hooks) · nada de `any`/casts/secretos · tokens del
Design System (cero estilos hardcodeados) · WCAG 2.2 AA · tests con cada feature · RLS obligatoria · migraciones
forward-only · IA/terceros solo en Edge Functions · no inventes en áreas `PD` · el merge lo autoriza un humano.
