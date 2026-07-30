# 05 · Rendimiento y Testing

## 10. Rendimiento

### 10.1 Listas y virtualización
- Toda lista potencialmente larga (Inventory, itinerario, bandeja del Studio, carruseles) usa **FlashList** (móvil) / virtualización (web). **Prohibido** `.map()` a pelo sobre listas sin límite conocido.
- Paginación **keyset** (`useInfiniteQuery`), **nunca `offset`**.
- `key` estable de dominio (no índice).

### 10.2 Re-render
- Memoizar items de lista (`React.memo(GarmentCard)`) y nodos del lienzo del Studio.
- Selectores Zustand para no re-renderizar por cambios irrelevantes.
- **No** crear objetos/funciones nuevos inline como props de componentes memoizados (romperían la memo); usar `useMemo`/`useCallback` ahí.
- No optimizar sin señal (perfil/medición). No micro-optimizar lo que no está en un camino caliente.

### 10.3 Imágenes
- `expo-image` con `placeholder` (blurhash), `contentFit`, disk cache.
- Servir **derivados**: thumbnail en rejillas, full solo en detalle/Studio. **Prohibido** cargar la imagen full en tarjetas de lista.
- Compresión en cliente antes de subir (lado largo ≤ 2048px, calidad ~0.8); limpiar EXIF.

### 10.4 Lazy / splitting / bundle
- Rutas/pantallas con carga diferida (Expo Router / code splitting web).
- ESM + tree-shaking; imports por módulo (no barrels pesados en runtime).
- **Prohibido** añadir dependencias pesadas para algo que resuelven pocas líneas o el stdlib/plataforma (§18). Vigilar el presupuesto de bundle (CI).

### 10.5 Prefetch
- Prefetch de detalle al aparecer en viewport; de imágenes del Studio al abrir bandeja; de clima al abrir un viaje. `prefetchQuery` en interacciones probables.

### 10.6 Objetivos (TAD §14.9)
Navegación entre tabs < 100 ms · Inventory (cache-warm) < 500 ms · Búsqueda < 800 ms · Crash-free ≥ 99.5%.

## 11. Testing (no se acepta código sin tests)

### 11.1 Regla base
- **Toda feature entra con sus tests** (unit + integración según aplique). Un PR sin tests para lógica nueva **no se acepta**.
- Tests **junto al código** (`*.test.ts(x)`), no en carpeta lejana.
- Sin frameworks ni fixtures innecesarios; el test más pequeño que falla si la lógica se rompe.

### 11.2 Qué testear en cada nivel
| Nivel | Herramienta | Qué |
|---|---|---|
| **Unitario** | Vitest | dominio puro (`core`): validaciones Zod, reglas (`forgottenPieces`, `isOutfitComplete`, rango de TripDay), reducers undo/redo, backoff de cola |
| **Integración** | Vitest + Supabase local | repositorios (CRUD+mapeo), **aislamiento RLS** (usuario A no ve datos de B), RPCs, triggers, optimistic+rollback |
| **E2E** | Detox/Maestro (móvil) · Playwright (web) | flujos críticos: onboarding→captura→inventario; buscar/filtrar; **drag+guardar outfit**; crear viaje+asignar; log out |
| **Visual** | Storybook + snapshots | componentes en claro/oscuro y breakpoints |
| **A11y** | axe (CI) + manual | foco/labels/roles/contraste en pantallas |
| **Performance** | perf budget CI | render de Inventory con seed ≥1.000; latencia búsqueda; bundle |

### 11.3 Reglas de calidad de tests
- Determinismo: sin dependencias de red reales (mockear `AiService`/`WeatherService` tras su interfaz). Sin `sleep` arbitrarios.
- Nombrar por comportamiento ("no permite guardar outfit vacío"), no por implementación.
- Un caso feliz + los límites relevantes (vacío, error, offline). No test triviales de getters.
- **Prohibido** bajar cobertura eliminando/skippeando tests para "pasar" (§18). Si un test estorba, se arregla la causa.
- Cobertura de dominio (`core`) objetivo ≥ 80%.

### 11.4 Datos de test
- Factories tipadas en `packages/core/test`; seeds deterministas. Nada de datos reales de usuarios.
