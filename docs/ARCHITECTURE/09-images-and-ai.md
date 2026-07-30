# 09 · Procesamiento de imágenes e IA

## 10. Pipeline de procesamiento de imágenes

Flujo completo Captura → Caché/Sync. Diseñado para ser **resiliente** (fallbacks) y **offline-first** (encolable).

```mermaid
flowchart TD
    A[Captura (cámara/galería)] --> B[Compresión en cliente]
    B --> C[Subida a Storage (URL firmada)]
    C --> D[Edge: remove-background]
    D -->|OK| E[Edge: classify-garment]
    D -->|falla/baja confianza| E2[Usar imagen original + marcar reintento]
    E --> F[Crear/Actualizar Garment (tags editables)]
    E2 --> F
    F --> G[Edge: embed-garment (pgvector)]
    G --> H[Cache local (TanStack + Expo Image)]
    H --> I[Sync multi-dispositivo]
```

### 10.1 Captura
- `expo-camera` / `expo-image-picker`. Permisos gestionados; denegación → estado explicativo (PRD §3.2).
- Modos Photo (1 foto), Burst (secuencia), Import (selección múltiple de galería).

### 10.2 Compresión (en cliente, antes de subir)
- Redimensionar lado largo ≤ **2048px**, recomprimir a JPEG/WebP calidad ~**0.8** (`expo-image-manipulator`). Umbrales confirmables (`PD` fino).
- **Limpiar EXIF** (geolocalización) por privacidad (§13).
- Genera thumbnail local para feedback inmediato (optimistic).

### 10.3 Subida
- `sign-upload` (Edge) devuelve URL firmada + path `user_id/originals/...`; el cliente sube el binario directo a Storage.
- Se registra `image_asset` (metadata) vía PostgREST.
- Offline: si no hay red, la subida se **encola** (§12) y la prenda queda `processing` con thumbnail local.

### 10.4 Eliminación de fondo
- Edge `remove-background` (BackgroundRemovalService, `PD-05`): produce PNG recortado → nuevo `image_asset` type `processed`.
- **Fallback:** si confianza < umbral o error → se usa la original y se marca la prenda para reintento; **nunca bloquea** la creación.

### 10.5 Clasificación IA
- Edge `classify-garment`: category, color(es), materials, season, style + confianzas.
- Resultado **editable** en la etapa de revisión (Photo) o provisional (Burst/Import).

### 10.6 Guardar
- `Garment` persistida (RPC/insert) con imágenes (original + processed) y atributos confirmados.
- Embedding generado (`embed-garment`) para búsqueda semántica.

### 10.7 Caché
- Imagen: `expo-image` (disk cache) sobre CDN de Storage; se sirven derivados (thumbnail para rejillas, full para detalle/Studio).
- Datos: TanStack Query (memoria + persister).

### 10.8 Sincronización
- La prenda y sus assets se propagan al resto de dispositivos vía backend (refetch en foco / Realtime opcional). Ver §12.

### 10.9 Rendimiento del pipeline
- Recorte/clasificación en **Edge** (no bloquea UI); Burst/Import van a **cola** con notificación.
- Objetivo: feedback visual inmediato (thumbnail local) aunque el procesado tarde.

---

## 11. Arquitectura IA

Todos los servicios IA se orquestan **server-side** (Edge Functions), tras interfaces en `packages/core/ports`. Proveedor concreto = `PD-05`; aquí, el **contrato, los prompts, fallbacks, rate-limits, costes y caché**.

### 11.1 Servicios

| Servicio | Interfaz (`core`) | Edge Function | Modelo |
|---|---|---|---|
| Clasificación de prenda | `AiService.classify` | `classify-garment` | visión-lenguaje (OpenAI, `PD-05`) |
| Embeddings (imagen/atributos) | `AiService.embed` | `embed-garment` | embeddings multimodal |
| Búsqueda semántica | `AiService.embedQuery` | `semantic-search` + RPC | embeddings + pgvector |
| Recomendación de outfit (match, conflictos, sugerencias) | `AiService.recommendOutfit` | `recommend-outfit` | LLM razonador |
| Insights (forgotten, whispers, colecciones IA) | `AiService.generateInsights` | `generate-insights` (batch/cron) | LLM |
| Eliminación de fondo | `BackgroundRemovalService.remove` | `remove-background` | segmentación |
| Clima | `WeatherService.get` | `get-weather` | API de clima |

### 11.2 Clasificación
- Entrada: imagen (URL firmada corta). Salida estructurada (JSON) validada con Zod.
- Determinismo: `temperature` baja; salida forzada a esquema (function calling / JSON mode).

### 11.3 Recomendaciones / Outfits
- `recommend-outfit`: recibe prendas del lienzo + preferencias de estilo del usuario + contexto (clima/ocasión) → `match_score` (0–100), `conflicts[]` (p. ej. texture clash), `suggestions[]` (garment_ids del inventario).
- Persiste `ai_recommendation`; el cliente muestra Match Score / avisos / "Apply Suggestion".

### 11.4 Clima
- `get-weather(location, dates)` → `weather_snapshot[]` (por día). **Cacheado** por (location, date) con expiración; degradación elegante si no disponible (PRD §3.7).

### 11.5 Predicciones
- "Forgotten Pieces" (>60 días) es **regla determinista** (no ML) sobre `last_worn_at` — barata y explicable.
- Predicciones más avanzadas: fuera de alcance (no diseñadas).

### 11.6 Prompt Engineering
- Prompts versionados en `supabase/functions/<fn>/prompts.ts` (bajo control de versiones).
- Salida **siempre estructurada** (JSON schema / function calling) y validada con Zod; nunca parsear texto libre.
- Incluir preferencias de estilo del usuario y taxonomía de categorías (`PD-13`) como contexto del sistema.
- Guardrails: no inventar categorías fuera del catálogo; devolver `unknown` con baja confianza en vez de alucinar.

### 11.7 Fallbacks
| Fallo | Fallback |
|---|---|
| Recorte falla | usar imagen original + marcar reintento |
| Clasificación falla | crear prenda con campos vacíos/editables (no bloquear) |
| Recomendación no disponible | ocultar Match Score/sugerencias; el outfit se guarda igual |
| Clima no disponible | viaje sin datos climáticos; sin Packing Insight climático |
| Embeddings no disponibles | búsqueda cae a filtro por atributos (category/color/brand) |

### 11.8 Rate limits
- Por usuario y por función, aplicados en Edge (token bucket en `pg`/KV). Cuotas exactas `PD` (ligadas a plan, `PD-02`).
- Protección anti-abuso en subida de imágenes.

### 11.9 Costes
- Palancas: **caché agresiva** (no reclasificar la misma imagen; embeddings persistidos; clima cacheado), **batch** para Burst/Import, resolución de imagen mínima suficiente, `temperature`/tokens acotados.
- Instrumentar coste por función (Observabilidad §15) para vigilar unit economics; alertas de gasto. Cuotas por plan cuando exista Premium (`PD-02`).

### 11.10 Caching de IA
- Recorte: resultado cacheado por hash de imagen original (idempotente).
- Embeddings: persistidos en `garment.embedding`; solo se recalculan si cambia la imagen/atributos.
- Recomendaciones: cacheadas por conjunto de prendas (clave = hash ordenado de garment_ids) durante una ventana.
- Clima: cacheado por (location, date).

### 11.11 Gobernanza y privacidad
- Claves solo en Edge (secrets de Supabase).
- Trazabilidad mínima para depurar precisión, respetando privacidad (§13); consentimiento para uso de datos en IA = `PD`.
