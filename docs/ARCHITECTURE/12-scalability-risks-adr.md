# 12 · Escalabilidad · Riesgos · ADRs

## 18. Escalabilidad

Principio: la **arquitectura de dominio no cambia** con la escala; cambian infra, índices, caché y proceso. Puntos calientes: base de datos (listados por usuario, búsqueda vectorial), Storage/CDN de imágenes y coste/latencia de IA.

### 18.1 100 usuarios (MVP / early)
- Supabase plan base; una instancia de Postgres. Sin tuning especial.
- Edge Functions on-demand; caché de IA básica.
- **Qué vigilar:** correcta instrumentación (KPIs, coste IA), RLS bien puesta. Nada que cambiar.

### 18.2 10.000 usuarios
- **DB:** verificar que todos los listados usan los índices de §7.9 y **paginación keyset**. `EXPLAIN ANALYZE` sobre los queries dominantes. Connection pooling (**Supavisor/PgBouncer**) para picos.
- **Búsqueda vectorial:** índice HNSW ajustado; monitorizar latencia.
- **Imágenes:** CDN de Storage absorbe lecturas; asegurar derivados/thumbnails (no servir full en rejillas).
- **IA:** caché agresiva (recorte por hash, embeddings persistidos, clima por location/date) para contener coste.
- **Qué cambia:** tuning de índices y pooling; nada estructural.

### 18.3 1.000.000 usuarios
- **DB:** read replicas para lecturas pesadas; particionar tablas grandes (`garment`, `image_asset`, `ai_recommendation`) por `user_id` (hash) o por tiempo. Revisar autovacuum/bloat.
- **Búsqueda vectorial:** si pgvector se queda corto, mover embeddings a índice dedicado **detrás de la misma interfaz** (`AiService`), sin tocar clientes (ADR-006 previó esto).
- **Colas IA:** worker pool escalable; backpressure; prioridad (interactivo > batch).
- **Storage:** políticas de ciclo de vida; posibles múltiples buckets/regiones; imágenes servidas 100% por CDN.
- **Coste IA:** cuotas por plan (Premium, `PD-02`), modelos más baratos para tareas simples, batch.
- **Qué cambia:** replicación/particionado, cola dedicada, posiblemente vector DB externa. Dominio intacto.

### 18.4 10.000.000 usuarios
- **DB:** sharding por `user_id` o mover a Postgres gestionado de mayor escala; CQRS para lecturas (proyecciones materializadas de Inventory/Home).
- **IA:** infra de inferencia propia/negociada para recorte/embeddings (coste dominante); colas regionales.
- **Multi-región** para latencia; edge caching.
- **Organización:** posible extracción de servicios (imagen/IA) fuera de Supabase Edge si el volumen lo justifica — la **interfaz `AiService`/`ImageService` lo permite** sin reescribir la app.
- **Qué cambia:** infra distribuida y equipo de plataforma; **el código de dominio y las apps apenas cambian** gracias a los límites (`packages/core`) e interfaces.

> Conclusión: las decisiones ADR (BaaS con Postgres estándar, efectos tras interfaz, keyset, dominio puro) hacen que escalar sea **operativo**, no una reescritura.

---

## 19. Riesgos técnicos (priorizados)

| # | Riesgo | Prob. | Impacto | Prioridad | Mitigación |
|---|---|---|---|---|---|
| R1 | RLS mal configurada → fuga de datos entre usuarios | Media | Crítico | **P0** | RLS en todas las tablas (§7.10) + tests de aislamiento (§16.2) + revisión obligatoria de policies en PR |
| R2 | Drag del Studio en móvil (diseño es simulador) no usable | Alta | Alto | **P0** | Implementar DnD real (gesture-handler/reanimated) + **alternativa accesible** (WCAG 2.5.7); E2E de drag |
| R3 | Coste/latencia de IA a escala | Alta | Alto | **P0** | Caché (recorte/embeddings/clima), batch, cuotas por plan, instrumentar coste, fallbacks |
| R4 | Proveedores IA/clima/recorte sin decidir (`PD-05`) | Alta | Medio | **P1** | Todo tras interfaz (`AiService`/`BackgroundRemovalService`/`WeatherService`); decidir antes de esas tareas |
| R5 | Recorte pobre con fotos reales del usuario | Media | Alto | **P1** | Fallback a original + reintento; guía de fotografía; umbral de confianza |
| R6 | Conflictos de sync multi-dispositivo | Media | Medio | **P1** | Optimistic + cola + last-write-wins; `save_outfit` transaccional; documentar límite de merge |
| R7 | Rendimiento de Inventory con miles de prendas | Media | Alto | **P1** | FlashList + keyset + derivados de imagen; test de performance con seed grande |
| R8 | Auth UI no diseñada (`PD-01`) bloquea lanzamiento | Alta | Crítico | **P0 (producto)** | Escalar a Producto; la capa técnica (Supabase Auth) ya está lista |
| R9 | iOS limita background sync | Media | Medio | **P2** | Best-effort + sync al foco/online; UX que no dependa de background garantizado |
| R10 | Deriva del design system (histórico de 2 sistemas) | Baja | Medio | **P2** | **Resuelto** (unificado a Woven); preset único + visual regression evita regresión |
| R11 | Alucinaciones de clasificación IA | Media | Medio | **P2** | Salida estructurada + Zod + guardrails (no inventar categorías) + edición del usuario |
| R12 | Migraciones destructivas en prod | Baja | Crítico | **P1** | Forward-only expand/contract + backups + gate manual (§17.5) |
| R13 | Fuga de claves de terceros | Baja | Crítico | **P1** | Claves solo en Edge secrets; nunca en cliente/repo; rotación |
| R14 | Deuda por `PD` sin resolver (planificación) | Alta | Medio | **P1** | Registro `PD` del PRD; áreas `PD` no se estiman hasta decidir |

---

## 20. ADRs (Architecture Decision Records)

Formato: **Problema · Opciones · Decisión · Justificación · Consecuencias.**

### ADR-001 — Backend: Supabase (BaaS)
- **Problema:** ¿backend propio o BaaS?
- **Opciones:** (a) Supabase; (b) Firebase; (c) backend propio (Node/Nest+Postgres).
- **Decisión:** **Supabase.**
- **Justificación:** Postgres estándar (modelo relacional de Woven, sin lock-in), Auth+Storage+Edge+RLS integrados, coste operativo mínimo para equipo pequeño.
- **Consecuencias:** dependencia de Supabase para Auth/Storage/Edge (mitigada por Postgres estándar y efectos tras interfaz); límites de Edge a vigilar a gran escala (§18.4).

### ADR-002 — Web: Vite SPA (Next.js diferido)
- **Problema:** framework web.
- **Opciones:** (a) React+Vite SPA; (b) Next.js.
- **Decisión:** **Vite SPA** ahora; Next.js reversible si aparece SSR/SEO (ligado a `PD-03`).
- **Justificación:** la app es autenticada (poco SEO); SPA es simple y comparte todo con móvil.
- **Consecuencias:** si se necesita marketing/compartir público con SSR, migrar rutas públicas a Next (coste acotado).

### ADR-003 — Móvil: Expo + Expo Router
- **Problema:** stack móvil y routing.
- **Opciones:** (a) Expo (managed)+Expo Router; (b) RN bare+React Navigation; (c) Flutter.
- **Decisión:** **Expo + Expo Router.**
- **Justificación:** módulos nativos listos (cámara/imagen/biometría), EAS (build/OTA), routing file-based unificado con web; Flutter rompería compartir TS.
- **Consecuencias:** dentro del ecosistema Expo (config plugins para nativo); ganancia enorme en velocidad.

### ADR-004 — Estilos: NativeWind + Tailwind preset compartido
- **Problema:** un design system para móvil y web sin duplicar tokens.
- **Opciones:** (a) NativeWind+Tailwind preset; (b) StyleSheet + CSS separados; (c) CSS-in-JS.
- **Decisión:** **NativeWind + preset Tailwind compartido.**
- **Justificación:** el diseño ya está en Tailwind con tokens; un preset único = design system de un origen.
- **Consecuencias:** algún componente requiere variante por plataforma (`.native/.web`).

### ADR-005 — Lógica de efectos en Edge Functions
- **Problema:** ¿dónde vive la lógica con secretos/terceros?
- **Opciones:** (a) Edge Functions; (b) en el cliente; (c) backend propio.
- **Decisión:** **Edge Functions.**
- **Justificación:** protege claves, centraliza rate-limits e idempotencia, desacopla proveedor.
- **Consecuencias:** una capa server que mantener; cold starts a vigilar.

### ADR-006 — Búsqueda semántica con pgvector
- **Problema:** almacenar/consultar embeddings.
- **Opciones:** (a) pgvector en el mismo Postgres; (b) DB vectorial dedicada.
- **Decisión:** **pgvector.**
- **Justificación:** evita otro sistema que sincronizar; suficiente hasta millones; misma RLS.
- **Consecuencias:** si escala lo exige, mover a vector DB **tras la misma interfaz** sin tocar clientes.

### ADR-007 — IA agnóstica de proveedor (tras interfaz)
- **Problema:** proveedores IA sin decidir (`PD-05`) pero hay que construir.
- **Opciones:** (a) acoplar a un proveedor; (b) interfaces `AiService`/`BackgroundRemovalService`/`WeatherService`.
- **Decisión:** **interfaces desacopladas**, con OpenAI + segmentación como implementación propuesta.
- **Justificación:** coste/latencia/calidad varían; permite A/B y cambio sin tocar app.
- **Consecuencias:** ligera indirección; libertad total de proveedor.

### ADR-008 — Estado: TanStack Query (servidor) + Zustand (UI)
- **Problema:** gestión de estado sin solapes.
- **Opciones:** (a) TanStack+Zustand; (b) Redux Toolkit (+RTK Query); (c) Context global.
- **Decisión:** **TanStack Query + Zustand.**
- **Justificación:** TanStack cubre caché/offline/optimistic; Zustand cubre UI efímera con mínimo boilerplate.
- **Consecuencias:** disciplina anti-solape (§6); dos librerías con roles claros.

### ADR-009 — Monorepo: pnpm + Turborepo
- **Problema:** gestionar apps+packages.
- **Opciones:** (a) pnpm+Turborepo; (b) Nx; (c) yarn workspaces.
- **Decisión:** **pnpm + Turborepo.**
- **Justificación:** ligero, caché de tareas, builds afectados; Nx aporta generadores innecesarios.
- **Consecuencias:** menos "magia"; configuración explícita.

### ADR-010 — Procesado en lote: cola sobre Postgres
- **Problema:** Burst/Import y jobs IA largos.
- **Opciones:** (a) `pgmq`/tabla de jobs + `pg_cron` + worker Edge; (b) servicio de colas externo.
- **Decisión:** **cola sobre Postgres** (pgmq/pg_cron) en MVP.
- **Justificación:** sin infra extra; suficiente para el volumen inicial.
- **Consecuencias:** a gran escala, mover a cola dedicada (§18.3) tras la misma interfaz.

### ADR-011 — E2E móvil: Detox vs Maestro (pendiente)
- **Problema:** herramienta E2E móvil.
- **Opciones:** (a) Detox; (b) Maestro.
- **Decisión:** ⛔ **PD** — evaluar en spike (Maestro por simplicidad de flujos; Detox por control fino, incl. drag).
- **Justificación/Consecuencias:** decidir antes de escribir la suite E2E móvil.

### ADR-012 — Paginación keyset
- **Problema:** paginar listados grandes (Inventory).
- **Opciones:** (a) keyset (cursor); (b) offset/limit.
- **Decisión:** **keyset.**
- **Justificación:** estable ante inserciones y eficiente con muchas filas.
- **Consecuencias:** cursores en la API; sin "ir a página N" arbitraria (no requerido).

### ADR-013 — Límites de dependencia forzados por lint
- **Problema:** evitar acoplamientos (p. ej. UI→Supabase).
- **Decisión:** ESLint boundaries + `no-restricted-imports` en CI.
- **Justificación/Consecuencias:** mantiene la regla de oro (`00`); PRs que la violan fallan.

### ADR-014 — Realtime desactivado por defecto
- **Problema:** ¿sincronizar en vivo entre dispositivos?
- **Decisión:** **off** en MVP; refetch en foco basta; activable sin cambios de arquitectura.
- **Justificación/Consecuencias:** menos coste/complejidad; se activa si un caso lo requiere.

### ADR-015 — Observabilidad: PostHog + Sentry (tras interfaz `Telemetry`)
- **Problema:** analytics y crash reporting.
- **Decisión:** **PostHog** (producto/flags) + **Sentry** (errores/release health), ambos tras `Telemetry`.
- **Justificación:** cubren KPIs del PRD; desacoplados por interfaz.
- **Consecuencias:** un wrapper que mantener; libertad de cambiar proveedor.

---

> **Cierre.** Con este TAD + el PRD, un ingeniero puede: montar el monorepo (`03`), crear el esquema y RLS (`07`), exponer datos (`08`), implementar el pipeline de imágenes e IA (`09`), gestionar estado/offline (`06`,`10`), y desplegar con CI/CD (`11`). Las decisiones abiertas son las `PD` del PRD y las marcadas aquí (ADR-011, mecanismo de cola, breakpoint tablet, SLOs/backups) — ninguna bloquea empezar el andamiaje del MVP.
