# 02 · Plan de sprints (S0 → MVP)

Cadencia: 2 semanas/sprint. Cada tarea: `ID · título · SP(talla) · deps`. Riesgos, entregables, demo y DoD por sprint. DoD detallado en `04`.

---

## Sprint 0 — Foundations  · Epic E00

**Objetivo.** Repositorio y automatización listos para que cualquiera clone, `pnpm install` y tenga apps arrancando, CI verde y Supabase conectado. Ningún feature; base sólida.

**Historias.**
- US-INFRA-01 — Como dev, quiero un monorepo con apps y packages, para compartir código.
- US-INFRA-02 — Como dev, quiero CI que valide cada PR, para no romper `main`.
- US-INFRA-03 — Como dev, quiero entornos y secrets configurados, para trabajar sin fricción.

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0001 | Monorepo pnpm + Turborepo (workspaces, pipelines) | M | — |
| T-0002 | `packages/config`: tsconfig base, ESLint (+boundaries ADR-013), Prettier | M | T-0001 |
| T-0003 | Bootstrap `apps/mobile` (Expo + Expo Router) que arranca | M | T-0001 |
| T-0004 | Bootstrap `apps/web` (React + Vite) que arranca | S | T-0001 |
| T-0005 | Proyecto Supabase (dev/staging/prod) + CLI + `supabase/` | M | — |
| T-0006 | Storybook para `packages/ui` | S | T-0001 |
| T-0007 | Vitest + config de test compartida | S | T-0002 |
| T-0008 | GitHub Actions: lint+typecheck+test+build afectados (Turbo) | L | T-0002,T-0007 |
| T-0009 | Variables de entorno por app + Supabase secrets + `.env.example` | S | T-0005 |
| T-0010 | Sentry + PostHog SDK inicializados tras interfaz `Telemetry` (no-op en dev) | M | T-0003,T-0004 |

**Riesgos.** Config de monorepo RN+web (resolución de módulos `.native/.web`); tiempos de CI. Mitigación: plantilla probada, caché Turbo.

**Entregables.** Repo con apps arrancando, CI verde, Storybook, Supabase conectado, telemetría stub.

**Demo.** `pnpm install` → app móvil y web abren pantalla "Hello Woven"; PR de ejemplo pasa CI.

**DoD.** CI verde en `main`; README de arranque; cualquier dev levanta el entorno en < 30 min.

---

## Sprint 1 — Arquitectura & Design System  · Epics E01, E02(inicio)

**Objetivo.** Design system utilizable (átomos/moléculas/nav), routing con tabs + flujos, tema claro/oscuro, providers; y arrancar el esquema de datos.

**Historias.**
- US-DS-01 — Como dev, quiero componentes del design system tipados, para construir pantallas rápido.
- US-NAV-01 — Como usuario, quiero navegar entre los 5 destinos, para moverme por la app.
- US-DATA-01 — Como dev, quiero el esquema base y tipos generados, para acceder a datos con tipos.

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0101 | Tailwind preset con tokens Woven (NativeWind+web) | M | T-0002 |
| T-0102 | Atoms (Text, Button, IconButton, Chip, Input, Select, ColorSwatch, Avatar, Badge, ProgressBar, Skeleton, Fab) + stories | L | T-0101 |
| T-0103 | Molecules base (SearchBar, ViewModeToggle, Chip rows, StatCard, WeatherPill, SettingRow) + stories | L | T-0102 |
| T-0104 | Organisms de navegación (BottomNavBar/TopNavBar) | M | T-0102 |
| T-0105 | Routing Expo Router: grupos `(tabs)`, `(onboarding)`, `capture`, gate de auth (stub) | L | T-0104 |
| T-0106 | Theme provider claro/oscuro/sistema + `useTheme` | M | T-0101 |
| T-0107 | Providers raíz (Sentry→Query→Auth(stub)→Theme→Telemetry) | M | T-0010,T-0106 |
| T-0108 | Templates (TabScreen, FullScreenFlow, EmptyState, TwoColumn) | M | T-0103 |
| T-0201 | Migraciones núcleo: enums + referencia + profile + image_asset | L | T-0005 |
| T-0202 | `supabase gen types` → `packages/api/generated` + check en CI | M | T-0201 |
| T-0111 | Visual regression baseline (Storybook + Playwright screenshots) | M | T-0102 |

**Riesgos.** NativeWind edge cases; divergencias móvil/web en componentes. Mitigación: `.native/.web` splits, visual regression desde S1.

**Entregables.** DS navegable en Storybook; app con 5 tabs vacíos y tema; esquema base migrado; tipos generados.

**Demo.** Navegar por los 5 tabs (placeholders) en móvil y web; alternar tema; Storybook con átomos/moléculas.

**DoD.** Componentes con stories + visual snapshots; tabs navegables; tipos generados en CI.

---

## Sprint 2 — Backend completo · Autenticación técnica · Perfil  · Epics E02, E03

**Objetivo.** Esquema completo con RLS y storage; capa técnica de auth (sesión, gate real) y pantalla de Perfil funcional (con datos reales). **UI de login/registro queda stub por `PD-01`.**

**Historias.**
- US-DATA-02 — Como dev, quiero todas las tablas con RLS, para acceso seguro.
- US-AUTH-01 (técnica) — Como sistema, quiero sesión y gate de auth, para proteger datos. (UI `PD-01`)
- US-PRF-01/02/03 — Preferencias de estilo, Total Items, Log Out (PRD §4.6).

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0203 | Migraciones: garment, outfit(+item), trip(+day, garment, weather), collection(+item), style_preference, ai_recommendation | XL→dividir | T-0201 |
| T-0204 | RLS en todas las tablas + policies por join (§7.10) | L | T-0203 |
| T-0205 | Storage buckets privados + policies por path + `sign-upload` Edge Fn | L | T-0201 |
| T-0206 | Triggers/funciones (updated_at, handle_new_user, trip_day range, soft_delete_garment) | M | T-0203 |
| T-0207 | Seeds de referencia (colors, fabrics, categories iniciales) | S | T-0203 |
| T-0301 | `AuthService` (Supabase Auth) + `expo-secure-store` sesión | M | T-0203 |
| T-0302 | Gate de auth real en routing + `AuthContext` | M | T-0301,T-0105 |
| T-0303 | `ProfileRepository` + `useProfile`/`useUpdateProfile` | M | T-0202,T-0204 |
| T-0304 | Pantalla Perfil: header, analíticas (Cost/Sustainability/Style **ocultas** `PD-07/08/12`), Total Items, Log Out | L | T-0303 |
| T-0305 | Style Preferences (add/remove) + `StylePreferenceRepository` | M | T-0303 |
| T-0306 | Ajustes: dark mode, unidades (resto `PD` como "próximamente") | M | T-0304,T-0106 |
| T-0307 | Tests integración RLS (aislamiento entre usuarios) | M | T-0204 |
| T-0308 | UI auth **stub** documentada como bloqueada por `PD-01` | S | T-0302 |

**Riesgos.** `PD-01` bloquea la UI real de acceso → sin ella no hay onboarding público. **P0 producto.** RLS mal puesta (R1). Mitigación: tests de aislamiento (T-0307) obligatorios.

**Entregables.** BD completa+RLS; sesión real; Perfil funcional; ajustes básicos.

**Demo.** Con sesión inyectada (dev), ver Perfil real, cambiar tema, añadir/quitar tags de estilo, Log Out.

**DoD.** RLS con tests de aislamiento verdes; Perfil persiste cambios; `PD-01` escalado formalmente.

---

## Sprint 3 — IA base · Captura (parte 1: cámara→subida→recorte)  · Epics E09, E04

**Objetivo.** Fotografiar una prenda, subirla y obtener recorte de fondo. Interfaces IA y primeras Edge Functions.

**Historias.** US-CAP-01 (recorte), US-CAP-06 (offline básico de captura).

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0901 | Interfaces `AiService`/`BackgroundRemovalService`/`ImageService` en `core/ports` | M | T-0202 |
| T-0902 | Edge Fn `remove-background` (proveedor tras interfaz, `PD-05`) + caché por hash | L | T-0205,T-0901 |
| T-0401 | Cámara + permisos (Photo) `expo-camera` | M | T-0107 |
| T-0402 | Compresión + limpieza EXIF (`expo-image-manipulator`) | M | T-0401 |
| T-0403 | Subida firmada a Storage + registro `image_asset` | M | T-0205,T-0402 |
| T-0404 | Etapa "procesado" (animación) + llamada a recorte + fallback a original | L | T-0902,T-0403 |
| T-0405 | Encolado básico de captura offline (integra con E10) | M | T-0403 |
| T-0910 | Rate-limit + logging de coste en Edge Fns | M | T-0902 |

**Riesgos.** Calidad de recorte con fotos reales (R5); coste/latencia IA (R3); `PD-05` proveedor. Mitigación: fallback a original, umbral de confianza, caché.

**Entregables.** Flujo cámara→subida→recorte con fallback; primeras Edge Fns con rate-limit.

**Demo.** Fotografiar una prenda → ver imagen recortada (o original si falla).

**DoD.** Recorte funciona o degrada; subida offline se encola; coste instrumentado.

---

## Sprint 4 — Captura completa · Inventario (inicio) · Offline (inicio)  · Epics E04, E05, E10

**Objetivo.** Cerrar la captura (clasificación editable, Burst, Import) y ver las prendas en un inventario básico. Bucle E2E fino: **capturar → aparece en inventario**.

**Historias.** US-CAP-02/03/04/05, US-INV-05 (FAB), US-SYN-01 (inicio).

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0903 | Edge Fn `classify-garment` (salida estructurada + Zod) | L | T-0901 |
| T-0406 | Etapa revisión: 5 campos editables + validación (Category/Color) | L | T-0903 |
| T-0407 | Confirmar → `GarmentRepository.create` (+ imágenes) | M | T-0203,T-0406 |
| T-0408 | Modo Burst (secuencia + cola de procesado) | L | T-0407 |
| T-0409 | Modo Import (galería múltiple + descarte no-prenda) | L | T-0407 |
| T-0501 | Rejilla de inventario (Editorial) virtualizada (FlashList) | L | T-0407 |
| T-0502 | `useGarments` (keyset infinite query) + estados vacíos | M | T-0501 |
| T-0503 | FAB → Captura | S | T-0501 |
| T-1001 | Persistencia de caché TanStack (MMKV/IndexedDB) | M | T-0107 |
| T-1002 | Cola offline (Zustand persistido) + drenaje básico | L | T-1001,T-0405 |

**Riesgos.** Rendimiento de rejilla (R7); consistencia de lote (R6). Mitigación: virtualización desde el inicio, tests de performance con seed grande.

**Entregables.** Captura completa (3 modos); inventario Editorial con prendas reales; caché+cola offline básicos.

**Demo.** Capturar en ráfaga 5 prendas → aparecen en el inventario; funciona sin conexión y sincroniza al volver.

**DoD.** Bucle capturar→inventario E2E verde (test E2E); offline básico probado.

---

## Sprint 5 — Inventario completo  · Epics E05, E09(búsqueda)

**Objetivo.** Inventario "corazón del producto" completo: búsqueda semántica, colecciones, 3 densidades, favoritos, detalle, insight IA.

**Historias.** US-INV-01/02/03/04/06.

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0904 | Edge Fn `embed-garment` + `garment.embedding` (pgvector) | L | T-0903 |
| T-0905 | Edge Fn `semantic-search` + RPC `search_garments` | L | T-0904 |
| T-0504 | Búsqueda semántica en UI + fallback a filtro por atributos | L | T-0905 |
| T-0505 | Modos Compact/Categories (densidades) + persistir preferencia | M | T-0501 |
| T-0506 | Colecciones (CRUD + filtro por chip) | L | T-0502 |
| T-0507 | Favoritos (optimistic) | M | T-0502 |
| T-0508 | Detalle de prenda (editar tags, borrar → soft-delete) | L | T-0502 |
| T-0509 | Insight IA + creación de colección ("Dusk Essentials") | M | T-0906 |
| T-0906 | Edge Fn `generate-insights` (batch) — wardrobe insight | M | T-0904 |

**Riesgos.** Calidad de búsqueda semántica; coste embeddings (R3). Mitigación: embeddings persistidos, fallback por atributos.

**Entregables.** Inventario completo y escalable.

**Demo.** Buscar "algo para una cena con lluvia" → resultados; filtrar por colección; cambiar densidad; favoritar; abrir detalle y editar.

**DoD.** Búsqueda con fallback; densidades persisten; soft-delete conserva referencias; perf con ≥1.000 prendas ok.

---

## Sprint 6 — Studio (crear outfit)  · Epic E06

**Objetivo.** Lienzo funcional con drag táctil real, capas/rotación, bandeja de armario, guardar outfit.

**Historias.** US-STU-01/02/03/05.

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0601 | Lienzo + render de items (gesture-handler/reanimated) | L | T-0508 |
| T-0602 | DnD táctil (móvil) + puntero (web) desde bandeja al lienzo | XL→dividir | T-0601 |
| T-0603 | Capas (z-index) + rotación + escala | L | T-0602 |
| T-0604 | Bandeja de armario colapsable (chips/búsqueda/filtro) | L | T-0502 |
| T-0605 | `useStudioDraft` (Zustand) + autosave de borrador | M | T-0601 |
| T-0606 | undo/redo (historial de acciones) | L | T-0605 |
| T-0607 | Guardar (RPC transaccional `save_outfit`) + validación ≥1 prenda | L | T-0203 |
| T-0608 | **Alternativa accesible al drag** (WCAG 2.5.7) | M | T-0602 |

**Riesgos.** **R2 (drag móvil, P0)**: complejidad de gestos; XL a dividir. Mitigación: spike temprano, alternativa accesible.

**Entregables.** Studio para componer y guardar outfits.

**Demo.** Arrastrar 3 prendas al lienzo, cambiar capa/rotar, deshacer, guardar; el outfit persiste y se recupera.

**DoD.** Drag funciona en iOS/Android/web (E2E); alternativa accesible; guardar transaccional.

---

## Sprint 7 — Studio IA · Home (inicio)  · Epics E06(IA), E07

**Objetivo.** Añadir asistencia IA al Studio (match score, sugerencias, conflictos) y construir el Home (Today's Look, Forgotten Pieces).

**Historias.** US-STU-04, US-HOME-01 (Today's Look), US-HOME-02 (Forgotten Pieces).

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0907 | Edge Fn `recommend-outfit` (match/conflicts/suggestions) | L | T-0904 |
| T-0609 | Match Score + estilista + "Apply Suggestion" en Studio | L | T-0907,T-0602 |
| T-0701 | `forgotten_pieces` (regla >60 días) + carrusel Home | M | T-0502 |
| T-0702 | Today's Look (outfit + clima) — clima integra E08/T-0801 | L | T-0907 |
| T-0703 | Bento analíticas Home (Wardrobe Value ok; Style Score **oculto** `PD-12`) | M | T-0304 |
| T-0704 | Agenda del Home — **stub** por `PD-06` | S | — |

**Riesgos.** `PD-06` (agenda) y `PD-12` (style score) → Home parcial; dependencia de clima (R). Mitigación: degradación elegante; ocultar lo `PD`.

**Entregables.** Studio con IA; Home con Today's Look y Forgotten Pieces.

**Demo.** En Studio, ver match score y aplicar una sugerencia; abrir Home y ver el look del día + prendas olvidadas.

**DoD.** Recomendación con fallback; Home no rompe si faltan clima/agenda; elementos `PD` ocultos.

---

## Sprint 8 — Home completo · Trips (inicio)  · Epics E07, E08

**Objetivo.** Cerrar Home y construir el núcleo de Trips (crear viaje, clima, maleta, outfits por día).

**Historias.** US-TRP-01/02, US-HOME (cierre).

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0801 | Edge Fn `get-weather` + `WeatherSnapshot` + caché | L | T-0901 |
| T-0802 | Crear viaje (destino+fechas, validación) + `TripRepository` | M | T-0203 |
| T-0803 | Maleta visual (add/remove prendas) | L | T-0508 |
| T-0804 | Outfits por día (asignar; RPC `assign_outfit_to_day`) | L | T-0607 |
| T-0805 | Clima por día en detalle de viaje | M | T-0801 |
| T-0705 | Home: pulido, estados vacíos, pull-to-refresh | M | T-0702 |

**Riesgos.** `PD-05` clima (proveedor); `PD-09` (Weight/Space → **no implementar**). Mitigación: ocultar métricas `PD-09`; degradar sin clima.

**Entregables.** Home completo; Trips con maleta y outfits por día.

**Demo.** Crear viaje a París, ver clima, añadir prendas a la maleta, asignar un outfit a un día.

**DoD.** Viaje crea/valida; asignación de outfit persiste; Weight/Space ausentes (`PD-09`).

---

## Sprint 9 — Trips completo · Offline hardening · Observabilidad  · Epics E08, E10, E11

**Objetivo.** Cerrar Trips (packing insight, blueprint, estado "outfit incompleto"), endurecer offline/sync y completar telemetría/monitorización.

**Historias.** US-TRP-03/04, US-SYN-01 (cierre), US-A11Y-01 (inicio auditoría).

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-0806 | Packing Insight (clima→prenda ausente) + "Add to Trip" | L | T-0801,T-0907 |
| T-0807 | Estado "Outfit Incomplete" por día (derivado) | M | T-0804 |
| T-0808 | Journey Blueprint (resumen agregado; mapa `PD-05` mapas) | M | T-0803 |
| T-1003 | Reintentos/backoff + resolución last-write-wins | L | T-1002 |
| T-1004 | Background sync (móvil task-manager / web SW) | L | T-1003 |
| T-1101 | Telemetría de eventos KPI (PostHog) + dashboards | M | T-0010 |
| T-1102 | Alertas Sentry (crash-free) + monitor de coste IA | M | T-0910 |

**Riesgos.** iOS background limits (R9); conflictos de sync (R6). Mitigación: best-effort + sync al foco.

**Entregables.** Trips completo; offline robusto; observabilidad en producción.

**Demo.** Día lluvioso muestra "outfit incompleto" y sugiere impermeable; editar offline y ver sync + dashboards de eventos.

**DoD.** Packing insight funciona; sync robusto con tests; KPIs instrumentados.

---

## Sprint 10 — Hardening · Accesibilidad · Release prep  · Epics E11, E12

**Objetivo.** Estabilizar, auditar WCAG 2.2 AA, perf budgets, y preparar publicación (builds, tiendas, canales).

**Historias.** US-A11Y-01 (cierre), US-REL-01 (publicación).

**Tareas técnicas.**
| ID | Tarea | SP | Deps |
|---|---|---|---|
| T-1103 | Auditoría WCAG 2.2 AA (axe + VoiceOver/TalkBack) en 7 pantallas | L | features |
| T-1104 | Perf budgets (bundle web, render Inventory, latencia búsqueda) en CI | M | T-1101 |
| T-1201 | Hardening: manejo de errores, estados vacíos, edge cases | L | features |
| T-1202 | EAS Build/Submit (iOS/Android) + canales pr/staging/production | L | T-0003 |
| T-1203 | Assets de tienda + compliance (privacidad, permisos) | M | T-1202 |
| T-1204 | Kill-switch por feature flag + procedimiento de rollback | M | T-1101 |
| T-1205 | E2E completos de flujos críticos (Detox/Maestro + Playwright) | L | features |

**Riesgos.** Rechazos de tienda (permisos/privacidad); regresiones de última hora. Mitigación: revisión de compliance temprana, feature flags, rollback ensayado.

**Entregables.** Build de release, canales configurados, auditoría AA pasada, E2E verdes.

**Demo.** App instalada vía TestFlight / Play Internal recorriendo el bucle completo end-to-end.

**DoD.** WCAG AA sin fails A/AA; E2E críticos verdes; build subido a canales internos; rollback ensayado.

> A partir de aquí: **estabilización de beta → producción** (ver `05`).
