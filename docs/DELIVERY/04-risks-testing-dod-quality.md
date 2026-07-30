# 04 · Riesgos · Testing por Epic · DoD · Calidad

## 4.1 Riesgos (por categoría, con dueño y mitigación)

Escala prioridad: P0 (bloqueante) → P3 (menor).

### Técnicos
| ID | Riesgo | Prob | Impacto | Pri | Mitigación | Dueño |
|---|---|---|---|---|---|---|
| RT-01 | RLS mal configurada → fuga entre usuarios | Media | Crítico | P0 | RLS en todas las tablas + tests de aislamiento (T-0307) | Backend |
| RT-02 | Drag del Studio en móvil (diseño = simulador) | Alta | Alto | P0 | Spike temprano, `reanimated/gesture-handler`, alternativa accesible (T-0608) | FE |
| RT-03 | Sync/conflictos multi-dispositivo | Media | Medio | P1 | Optimistic + cola + last-write-wins; `save_outfit` transaccional | FE/BE |
| RT-04 | Migraciones destructivas en prod | Baja | Crítico | P1 | Forward-only expand/contract + backups + gate manual | BE |
| RT-05 | Cold starts / límites de Edge Functions | Media | Medio | P2 | Caché, batch, vigilar latencia; plan de escalado (TAD §18) | BE/IA |

### Producto
| ID | Riesgo | Pri | Mitigación |
|---|---|---|---|
| RP-01 | `PD-01` (auth UI) bloquea lanzamiento | P0 | Escalar a Producto en S2; capa técnica lista |
| RP-02 | Cold-start de catalogación | P1 | Burst+Import+recorte IA; medir prendas/1ª sesión |
| RP-03 | Métricas cuantitativas sin fórmula (`PD-07/08/12`) confunden | P1 | Ocultarlas en MVP hasta definición |

### UX
| ID | Riesgo | Pri | Mitigación |
|---|---|---|---|
| RUX-01 | Densidad editorial vs armarios grandes | P1 | 3 densidades + virtualización + búsqueda |
| RUX-02 | Sin alternativa al drag → excluye a algunos usuarios | P0 | WCAG 2.5.7 (T-0608) |
| RUX-03 | Estados vacíos/errores no diseñados | P2 | Track de diseño resuelve edge states antes de cada sprint |

### Rendimiento
| ID | Riesgo | Pri | Mitigación |
|---|---|---|---|
| RPF-01 | Inventory lento con miles de prendas | P1 | FlashList + keyset + derivados; perf budget en CI (T-1104) |
| RPF-02 | Imágenes pesadas | P1 | Compresión cliente + thumbnails/CDN |

### Coste IA
| ID | Riesgo | Pri | Mitigación |
|---|---|---|---|
| RCI-01 | Gasto de inferencia (recorte/clasificación/embeddings) | P0 | Caché por hash, embeddings persistidos, batch, cuotas; monitor de coste (T-1102) |
| RCI-02 | Latencia IA degrada UX | P1 | Feedback optimista (thumbnail local), procesado async |

### Coste almacenamiento
| ID | Riesgo | Pri | Mitigación |
|---|---|---|---|
| RCS-01 | Crecimiento de imágenes (original+processed por prenda) | P1 | Compresión, derivados, ciclo de vida en Storage; cuotas por plan (`PD-02`) |

### Publicación
| ID | Riesgo | Pri | Mitigación |
|---|---|---|---|
| RPB-01 | Rechazo de tienda (permisos cámara/foto, privacidad) | P1 | Compliance temprano (T-1203), textos de permiso claros |
| RPB-02 | Sin rollback de binario | P1 | Feature flags + kill-switch + OTA (EAS Update) (T-1204) |

## 4.2 Testing por Epic (dentro de cada epic, no al final)

| Epic | Unit | Integración | E2E | Visual | Otros |
|---|---|---|---|---|---|
| E00 | config de test | pipeline CI corre | — | baseline Storybook | smoke build |
| E01 | lógica de tema | — | navegación entre tabs | **snapshots de todos los componentes** | — |
| E02 | validaciones dominio | **RLS aislamiento**, RPCs, triggers | — | — | migraciones idempotentes |
| E03 | reglas de perfil/prefs | auth+gate, ProfileRepo | login→perfil (con auth `PD-01` stub) | pantalla perfil | seguridad de sesión |
| E04 | validación captura (Category/Color) | subida+recorte+clasificación (mock IA) | **capturar→inventario** | etapas de captura | fallback recorte |
| E05 | reglas de filtro/forgotten | búsqueda, colecciones, soft-delete | buscar/filtrar/favoritar/detalle | rejilla en 3 densidades | **perf con ≥1.000 prendas** |
| E06 | reducers undo/redo, save | save_outfit transaccional | **drag+guardar (iOS/Android/web)** | lienzo/bandeja | alternativa accesible |
| E07 | forgotten>60d, derivaciones | recommend/insights (mock) | Home muestra look/olvidadas | Home bento | degradación sin clima/agenda |
| E08 | validación fechas, incomplete | weather, assign_outfit_to_day | crear viaje+asignar outfit | detalle de viaje | degradación sin clima |
| E09 | parsers/guardrails Zod | Edge Fns contrato+rate-limit | — | — | **monitor de coste** |
| E10 | cola/backoff | sync online/offline | editar offline→sync | — | background sync |
| E11 | — | — | **flujos críticos** | regresión global | **a11y axe + perf budgets** |
| E12 | — | — | E2E full recorrido | — | build/submit, rollback ensayado |

Regla: **una feature no se cierra sin sus tests** (parte del DoD). El E2E de flujos críticos es responsabilidad continua de E11, no un sprint final.

## 4.3 Definition of Done (por nivel)

**Task terminada** cuando:
1. Código implementado según descripción y criterios de aceptación.
2. Tests correspondientes (unit/integración) escritos y **verdes en CI**.
3. `typecheck` + `lint` (incl. boundaries) + `format` sin errores.
4. Si toca UI: accesibilidad básica verificada (foco, labels, contraste, targets 44px, `alt`, reduced-motion) y **snapshot visual** actualizado/aprobado.
5. Si cambia contrato/API/datos: **tipos generados** actualizados y documentación tocada.
6. Revisada por ≥1 par (PR aprobado).
7. Desplegada a `staging` sin regresiones (preview/EAS Update canal).
8. Sin `PD` sin marcar: si toca un área `PD`, queda **stub documentado**, no adivinado.

**Story terminada** cuando: todas sus tasks Done + criterios de aceptación de la historia verificados + demo-able.

**Feature terminada** cuando: sus stories Done + E2E de su flujo verde + telemetría instrumentada + estados vacíos/error cubiertos.

**Epic terminado** cuando: features Done + testing del epic completo (§4.2) + sin deuda P0/P1 abierta + documentación de decisiones (ADR si aplica).

**Sprint terminado** cuando: objetivo cumplido, demo realizada, DoD de cada ítem satisfecho, sin bugs P0 abiertos, checklist de calidad (§4.4) pasada.

## 4.4 Checklist de calidad (obligatoria antes de cerrar cualquier tarea)

```
[ ] Criterios de aceptación cumplidos y verificados
[ ] Tests añadidos/actualizados y verdes (unit/integración según aplique)
[ ] CI verde: lint + typecheck + format + boundaries + tests
[ ] Sin console.logs/TODOs sin ticket; sin código muerto
[ ] Manejo de errores y estados (loading/empty/error) cubiertos
[ ] Accesibilidad (si UI): foco visible, labels/alt, contraste AA, target 44px, reduced-motion
[ ] Rendimiento: listas virtualizadas; imágenes con derivados; sin re-renders evidentes
[ ] Seguridad: sin secretos en cliente; RLS aplica; validación en cliente y servidor
[ ] Offline (si aplica): optimistic + rollback; encolado correcto
[ ] Telemetría: eventos KPI relevantes emitidos
[ ] i18n: sin textos hardcodeados fuera de la capa i18n (aunque idiomas sean PD-10)
[ ] Áreas PD: stub documentado, nunca asumido
[ ] PR revisada por un par; documentación/ADR actualizada si cambia contrato
[ ] Desplegado a staging y verificado
```
