# 11 · Observabilidad · Testing · CI/CD

## 15. Observabilidad

Todo detrás de una interfaz `Telemetry` (`packages/analytics`) para no acoplar el código a proveedores.

### 15.1 Logs
- Cliente: logger con niveles; en prod solo warn/error → Sentry breadcrumbs.
- Edge Functions: logs estructurados (JSON) con `request_id`, `user_id` (hash), función, latencia, coste IA. Consultables en Supabase logs.

### 15.2 Analytics — PostHog
- Eventos de producto que instrumentan los KPIs del PRD §2.3: `onboarding_completed`, `garment_captured` (mode), `background_removal_result`, `classification_edited`, `search_performed`, `outfit_saved`, `trip_created`, `day_outfit_assigned`, `ai_suggestion_applied`, `view_mode_changed`.
- Funnels: activación (onboarding→1ª prenda), creación de outfit, planificación de viaje.
- Feature flags (PostHog) reutilizables para gating futuro de Premium (`PD-02`) sin acoplar código.

### 15.3 Errores — Sentry
- RN + web + Edge. Captura de excepciones, breadcrumbs, source maps/symbolication.
- **Release health**: crash-free sessions/users (KPI), regresiones por release.
- Alertas a canal del equipo ante picos.

### 15.4 Eventos (dominio)
- Eventos de negocio relevantes (creación de prenda, sync completada) emitidos por la capa de aplicación; consumidos por `Telemetry`. Desacoplados de la UI.

### 15.5 Métricas
- Producto: DAU/WAU/MAU, retención D1/D7/D30, prendas/usuario, outfits/semana (PostHog).
- Técnicas: p95 de operaciones (§14.9), tasa de error por función, **coste IA por función/usuario**, tasa de éxito de recorte, % tags auto-aceptados.

### 15.6 Monitoring / Alertas
- Dashboards: salud de Edge Functions (latencia/errores), gasto IA, crash-free, latencia de búsqueda.
- Alertas: subida de errores (Sentry), gasto IA sobre umbral, caída de tasa de recorte.
- ⛔ **PD**: SLOs formales y on-call.

---

## 16. Testing

Pirámide: muchos unitarios, integración media, pocos E2E de flujos críticos. CI bloquea merge si falla.

### 16.1 Unitarios (Vitest)
- **Dominio `core`**: validaciones Zod (Captura, Trip), reglas puras (`forgottenPieces`, `isOutfitComplete`, rango de `TripDay`), reducers de undo/redo del Studio, lógica de cola offline/backoff.
- Objetivo cobertura: ≥ 80% en `core` (propuesto).

### 16.2 Integración (Vitest + Supabase local)
- Repositorios contra Postgres de test: CRUD + mapeo a dominio.
- **Aislamiento RLS**: un usuario no puede leer/escribir datos de otro (test explícito por tabla).
- Optimistic update + rollback en error.
- RPCs (`save_outfit`, `search_garments`, `assign_outfit_to_day`).

### 16.3 E2E
- **Móvil** (Detox o Maestro, `PD` ADR-011) sobre build real: onboarding→captura→prenda; búsqueda/filtro Inventory; **crear y guardar outfit con drag táctil**; crear viaje + asignar outfit; log out.
- **Web** (Playwright): mismos flujos + navegación por teclado.

### 16.4 Visual regression
- Storybook de `packages/ui` + snapshots (Playwright/Chromatic): componentes en claro/oscuro y breakpoints (móvil/tablet/web). Falla ante diffs no aprobados.

### 16.5 Performance
- Mediciones automatizadas: tiempo de render de Inventory con dataset grande (seed de ≥1.000 prendas), latencia de búsqueda; presupuesto de bundle (web) en CI.

### 16.6 Accessibility
- `axe` automatizado (web) en CI; auditoría manual VoiceOver/TalkBack por release; checks de foco/labels/contraste en las 7 pantallas (WCAG 2.2 AA, PRD §14).

### 16.7 Datos de test
- Fixtures deterministas + seed de demo; factories tipadas en `packages/core/test`.

---

## 17. CI/CD

Plataforma: **GitHub Actions** + **EAS** (móvil) + hosting web (Vercel/Netlify, `PD`).

### 17.1 Pipeline de PR
```mermaid
flowchart LR
    PR[Pull Request] --> A[install pnpm]
    A --> B[turbo affected: lint]
    B --> C[typecheck]
    C --> D[unit + integración (Supabase local)]
    D --> E[visual regression]
    E --> F[a11y axe]
    F --> G[build afectado]
    G --> H[Preview: web (deploy) + EAS Update (canal PR)]
```
- Solo tareas **afectadas** (`turbo run --filter=...[origin/main]`).
- Verificación de **tipos generados** de la BD (falla si difieren).
- Migraciones aplicadas a una BD efímera para tests de integración.

### 17.2 Lint / Tests / Preview
- Lint (ESLint + boundaries de dependencias, ADR-013) + Prettier + typecheck estricto.
- Preview web por PR (URL); **EAS Update** publica un canal por PR para probar en dispositivo sin rebuild.

### 17.3 Deploy
- **Merge a `main`** → staging: aplicar migraciones (staging), deploy Edge Functions, deploy web (staging), EAS Update canal `staging`.
- **Release** (tag) → prod: migraciones prod (revisión manual/gate), deploy Edge Functions, deploy web prod, y build de tienda vía **EAS Build/Submit** (iOS/Android). OTA de JS vía **EAS Update** canal `production` para cambios sin binario.

### 17.4 EAS
- `eas build` (binarios), `eas submit` (tiendas), `eas update` (OTA de JS/assets). Canales: `pr-*`, `staging`, `production`.
- Reglas: cambios nativos → nuevo build; cambios solo JS → OTA.

### 17.5 Producción y gates
- Migraciones destructivas requieren aprobación manual y **backups** previos.
- Feature flags (PostHog) para lanzar progresivamente.

### 17.6 Rollback
- **Web**: redeploy del build anterior (inmediato).
- **OTA (EAS Update)**: republicar el update previo en el canal (rollback en minutos).
- **Binario**: no hay rollback en tienda; mitigación = **kill switch** por feature flag + OTA de corrección.
- **BD**: las migraciones deben ser **hacia delante** (forward-only) con expand/contract; rollback = migración compensatoria + restore desde backup si es crítico.
- ⛔ **PD**: política formal de RTO/RPO y backups (frecuencia/retención).
