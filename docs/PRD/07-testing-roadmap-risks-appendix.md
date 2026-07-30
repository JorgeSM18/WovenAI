# 07 · Testing · Roadmap · Riesgos · Anexos

## 15. Testing

### 15.1 Unitarios
- **Alcance:** reglas de dominio puras (`packages/core`): validaciones Zod (Captura: Category/Color obligatorios; Trip: fechas), derivaciones (TripDay dentro de rango, `is_outfit_complete`), lógica de cola offline, reglas de "Forgotten Pieces" (>60 días).
- **Herramientas:** Vitest/Jest.
- **CA:** cobertura mínima de dominio ⛔ **PD** target (proponer ≥ 80% en `core`).

### 15.2 Integración
- **Alcance:** hooks de datos (TanStack Query + Supabase) contra instancia de test; RLS (un usuario no accede a datos de otro); flujo de subida de imagen; optimistic update + rollback.
- **Herramientas:** Testing Library + Supabase local/CI.

### 15.3 E2E
- **Alcance (flujos críticos §5):** onboarding→captura→prenda; búsqueda/filtrado en Inventory; crear y guardar outfit en Studio (incluye drag táctil); crear viaje + asignar outfit; log out.
- **Herramientas:** móvil **Maestro** o **Detox**; web **Playwright**. (⛔ **PD** elección final.)

### 15.4 Visual Regression
- **Alcance:** componentes del design system (`packages/ui`) y pantallas clave en claro/oscuro y breakpoints (móvil/tablet/web).
- **Herramientas:** Storybook + snapshot visual (Chromatic/Playwright screenshots). ⛔ **PD** herramienta.

### 15.5 Accesibilidad (parte de CI)
- axe automatizado en web; auditoría manual VoiceOver/TalkBack por release (§14.5).

### 15.6 Reglas de CI
- PR debe pasar: lint + typecheck + unit + integración + visual + a11y automatizado antes de merge. ⛔ **PD** pipeline concreto.

---

## 16. Roadmap

> Solo incluye lo respaldado por diseño aprobado. Premium y superficies no diseñadas quedan como pendientes.

### 16.1 MVP (bucle central)
- Autenticación (capa técnica Supabase; **UI bloqueada por `PD-01`**).
- Onboarding (3 vías).
- Captura (Photo/Burst/Import + recorte + clasificación editable).
- Inventario (búsqueda semántica, colecciones, 3 densidades, favoritos, FAB).
- Studio (lienzo táctil, IA match/sugerencias, guardar outfit).
- Home (Today's Look, Forgotten Pieces) — *con dependencias `PD-06` agenda, `PD-05` clima; degradar si faltan*.
- Trips (crear viaje, maleta, outfits por día, packing insight) — *sin Weight/Space `PD-09`*.
- Profile (preferencias de estilo, Total Items, ajustes básicos, dark mode, log out) — *sin Cost-per-wear/Sustainability `PD-07/08`*.
- Sincronización + offline + accesibilidad AA.

### 16.2 v1.1
- Pantalla "Mis outfits" (listado) — requiere diseño (`PD`).
- Métricas de armario reales (Cost Per Wear, Sustainability, Style Score) — requiere `PD-07/08/12`.
- Notificaciones (Pending Actions, alertas de clima) — `PD-04`.
- Data Export (JSON/PDF) — `PD-11`.
- Estados de viaje (activo/pasado) — `PD`.

### 16.3 v2
- Compartir outfits (Share) — `PD-03`.
- i18n multi-idioma — `PD-10`.
- Integración de calendario/agenda — `PD-06`.
- ⛔ Community / Marketplace / Wearables — **no diseñados**, fuera de alcance PRD.

### 16.4 Premium
- ⛔ **PD-02** — no hay diseño de paywall, tiers, precios ni límites por plan. La arquitectura (RLS, rate limits, feature flags) queda **preparada** para gating, pero **no se implementa** hasta definición de Producto.

---

## 17. Riesgos

### 17.1 Funcionales / producto
| Riesgo | Impacto | Mitigación |
|---|---|---|
| *Cold-start* (catalogar es tedioso) | Abandono temprano | Burst + Import + recorte/clasificación IA (ya en diseño); medir prendas/1ª sesión. |
| Precisión de clasificación IA baja | Armario impreciso, desconfianza | Todos los tags editables; medir auto-aceptado vs editado; umbral de confianza. |
| Métricas cuantitativas (Style/Sustainability/Cost) sin fórmula clara pueden ser confusas o intrusivas | Percepción negativa | **No implementar** hasta `PD-07/08/12`; ocultarlas en MVP. |
| Densidad editorial vs armarios grandes | Usabilidad a escala | 3 densidades + virtualización + búsqueda (mitigado en diseño). |
| Dependencia de agenda/clima para Home/Trips | Home vacío si faltan datos | Degradación elegante; `PD-05/06`. |

### 17.2 Técnicos
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Drag del Studio en móvil (el diseño es simulador) | Función estrella no usable | Implementar DnD real con gesture-handler/reanimated; **alternativa accesible** (WCAG 2.5.7). |
| Coste/latencia de IA a escala | Coste operativo, UX lenta | Orquestar en Edge Functions, cachear resultados, rate limits, procesado en lote asíncrono. |
| Recorte de fondo con fotos reales del usuario | Recortes pobres | Fallback a original + reintento; guía de fotografía. |
| Sincronización/conflictos multi-dispositivo | Pérdida/inconsistencia de datos | Optimistic + cola offline + last-write-wins; revisar merge de outfits (`PD`). |
| RLS mal configurada | Fuga de datos entre usuarios | RLS obligatoria en todas las tablas + tests de integración de aislamiento. |
| Dos sistemas de diseño (histórico) | Inconsistencia | **Resuelto**: unificado a Woven (Hanken/#000000), sistema único. |
| Proveedores IA/clima sin definir (`PD-05`) | Bloqueo de integración | Desacoplar tras interfaz en Edge Functions; decidir proveedor antes de esas tareas. |

### 17.3 Riesgos bloqueantes de planificación
- Áreas con `PD` sin resolver **no son estimables**; ver registro en `00-index.md`. Resolver `PD-01` (auth UI) es prerequisito para lanzar.

---

## 18. Anexos

### 18.1 Glosario
- **Garment**: prenda catalogada.
- **Outfit**: conjunto de prendas posicionadas (lienzo del Studio).
- **Collection**: agrupación nombrada de prendas (manual o generada por IA).
- **Trip / TripDay**: viaje y sus días con outfit asignado.
- **Studio**: editor de outfits (tab "Outfits").
- **Forgotten Piece**: prenda sin usar > 60 días.
- **Match Score**: puntuación IA de coherencia de un outfit (0–100).
- **Packing Insight**: sugerencia IA de prenda para el clima del viaje.
- **Wardrobe Whisper / Wardrobe Insight / AI NUDGE**: variantes de recomendación IA por superficie.
- **Cold-start**: fricción inicial de catalogar el armario.
- **RLS**: Row Level Security (Postgres/Supabase).

### 18.2 Decisiones (registro)
| # | Decisión | Motivo |
|---|---|---|
| D-01 | Sistema de diseño único = **Woven** (Hanken Grotesk, `primary #000000`) | Se eliminó el sistema Inter/indigo y se migraron todas las pantallas. |
| D-02 | Taxonomía de navegación = Home/Inventory/Outfits/Trips/Profile con iconos e etiquetas fijos | Unificación de navegación (bloqueante resuelto). |
| D-03 | Studio único = `outfits_woven_final` (con soporte táctil); eliminado el duplicado Inter | Un solo builder, táctil. |
| D-04 | Backend Supabase + Edge Functions para orquestar IA | Seguridad de claves, rate limits, desacople de proveedor. |
| D-05 | Estado servidor con TanStack Query; estado UI con Zustand | Caching/offline/optimistic vs estado efímero. |
| D-06 | Monorepo (pnpm + Turborepo) compartiendo core/data/store/ui | Reutilización móvil/web. |
| D-07 | Métricas cuantitativas (Cost/Sustainability/Style Score) **fuera de MVP** hasta tener fórmula | Evitar métricas sin definición ni valor claro. |

### 18.3 Supuestos
- S-01: 1 prenda por foto en Captura (multi-prenda es `PD`).
- S-02: "Forgotten Pieces" = umbral 60 días (del copy del diseño).
- S-03: Un `TripDay` admite 1 outfit; "spare sets" es concepto agregado (`PD`).
- S-04: Brands/Colors/Fabrics como tablas de referencia; catálogo global vs libre = `PD`.
- S-05: Web usa top nav; móvil bottom nav; tablet conmuta por ancho (breakpoint `PD`).
- S-06: last-write-wins por `updated_at` para conflictos de sync (salvo refinamiento en outfits).

### 18.4 Preguntas abiertas (índice de `PD`)
| ID | Pregunta |
|---|---|
| PD-01 | ¿Método y UI de autenticación? (email/OAuth/Apple/Google; sign-up/login/reset) |
| PD-02 | ¿Modelo Premium? (tiers, precios, límites por plan, paywall) |
| PD-03 | ¿Flujo y formato de "Share"? |
| PD-04 | ¿Sistema de notificaciones? (push/in-app, permisos, triggers) |
| PD-05 | ¿Proveedores de clima, recorte de fondo y modelos IA/embeddings? |
| PD-06 | ¿Origen de la "Daily Agenda" del Home? |
| PD-07 | ¿Origen del precio de compra (Cost Per Wear)? |
| PD-08 | ¿Fórmula del Sustainability Score? |
| PD-09 | ¿Datos/fórmula de Weight Est. y Space Remaining (Trips)? |
| PD-10 | ¿Idiomas soportados (i18n)? |
| PD-11 | ¿Esquema y alcance del Data Export? |
| PD-12 | ¿Fórmula del Style Score? |
| PD-13 | ¿Taxonomía canónica de categorías (consolidar categoría vs ocasión/uso)? |
| PD-14 | ¿Diseño de "Mis outfits" (listado), estados de viaje, borrado de cuenta, alternativa accesible al drag? |

> **Este PRD es utilizable como base de desarrollo del MVP.** Las áreas marcadas `PD` deben resolverse con Producto antes de implementar sus features; el resto del bucle central está completamente especificado sobre el diseño aprobado.
