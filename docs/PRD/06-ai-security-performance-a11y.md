# 06 · IA · Seguridad · Rendimiento · Accesibilidad

## 11. IA

> Todas las capacidades están respaldadas por pantallas aprobadas. El **proveedor/modelo concreto de cada una es `PD-05`**; aquí se definen requisitos funcionales, entradas/salidas y reglas, no el vendor.

### 11.1 Procesamiento de imágenes / Eliminación de fondo
- **Entrada:** foto original (`ImageAsset` original).
- **Salida:** imagen con fondo eliminado (`ImageAsset` processed, PNG con transparencia) + máscara.
- **Dónde:** Captura etapa 2 ("Refining Canvas").
- **Reglas:** si la confianza < umbral (`PD`), permitir uso de original y marcar reintento. Ejecutar en Edge Function (no en cliente). Cachear resultado.
- **CA:** el 100% de capturas produce o bien recorte válido o bien fallback a original sin bloquear.

### 11.2 Clasificación
- **Entrada:** imagen (recortada u original).
- **Salida:** `category`, `primary_color` (+ paleta), `materials[]`, `season`, `style` — **con confianza** por campo.
- **Dónde:** Captura etapa 3 (prellenado editable).
- **Reglas:** todos los campos son **sugerencias editables**; nunca se persisten sin pasar por revisión (modo Photo) o quedan como provisionales editables (Burst/Import). Registrar tasa auto-aceptado vs editado (§2.3).

### 11.3 Búsqueda semántica
- **Entrada:** query en lenguaje natural ("Find something for a rainy dinner").
- **Salida:** lista ordenada de `Garment` relevantes.
- **Implementación:** embeddings de prenda (imagen + atributos) en **pgvector**; similitud + filtros por atributos. Modelo de embeddings = `PD-05`.
- **Reglas:** query vacía → todo; sin resultados → estado vacío. Latencia p95 objetivo (§13).

### 11.4 Generación / coherencia de outfits
- **Match Score (0–100):** puntuación de coherencia del conjunto en el Studio; se recalcula al cambiar prendas.
- **Detección de conflictos:** avisos tipo "texture clash: Silk & Wool".
- **Sugerencias:** proponer piezas que faltan ("add minimalist loafers"); "Apply Suggestion" las añade al lienzo.
- **Reglas:** informativo, nunca bloquea guardar. Persistir como `AIRecommendation` (type=outfit_suggestion/texture_clash).

### 11.5 Recomendaciones y sugerencias contextuales
- **Forgotten Pieces (Home):** prendas con `last_worn_at` > 60 días (regla temporal explícita) + "AI NUDGE" de combinación.
- **Wardrobe Insight (Inventory):** detecta patrones y **crea colecciones** ("Dusk Essentials").
- **Wardrobe Whispers (Profile):** insights personalizados (p. ej. "charcoal blazer sin usar 3 semanas → combínalo con linen trousers").
- **Today's Look (Home):** propone outfit del día según clima + agenda (`PD-06` origen de agenda).
- **Reglas:** todas se registran como `AIRecommendation` con `status` (active/dismissed/applied).

### 11.6 Clima
- **Entrada:** destino + fechas (Trips) o ubicación (Home).
- **Salida:** `WeatherSnapshot` por día (temp, condición).
- **Uso:** Today's Look (Home), Packing Insight y estado "Outfit Incomplete" (Trips).
- ⛔ **PD-05:** proveedor de clima. Regla: cachear con expiración; degradar con elegancia si no disponible.

### 11.7 Gobernanza IA
- Orquestación server-side (Edge Functions); claves nunca en cliente.
- Rate limits por usuario (§12).
- Trazabilidad: guardar entrada/salida mínima para depurar precisión (respetando privacidad §12).
- ⛔ **PD:** política de reentrenamiento/feedback loop, uso de datos del usuario para mejorar modelos (requiere consentimiento — ver §12).

---

## 12. Seguridad

### 12.1 Autenticación
- **Supabase Auth**. Sesión con JWT; refresh tokens gestionados por SDK. Biometría (FaceID) para desbloquear la app = ajuste de Privacy & Security (🟡, `PD` alcance).
- ⛔ **PD-01:** métodos concretos (email/password, magic link, Apple, Google) y UI.

### 12.2 Autorización
- Modelo simple MVP: cada usuario accede **solo a sus datos**. No hay roles/compartición en MVP (compartir = `PD-03`).

### 12.3 RLS (Row Level Security) — obligatorio
- **Activar RLS en todas las tablas de usuario.** Política base por tabla:
  ```sql
  -- ejemplo Garment
  alter table garment enable row level security;
  create policy garment_owner on garment
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  ```
- Igual para: user, outfit, outfit_item (vía join a outfit), trip, trip_day, collection, collection_item, style_preference, ai_recommendation, weather_snapshot, image_asset.
- **Storage**: buckets privados; políticas por `user_id` en el path; URLs firmadas de vida corta.

### 12.4 Privacidad
- Datos e imágenes son privados por defecto.
- "Privacy mode" y "Blocked brands" = ⛔ **PD** definición.
- Consentimiento para uso de datos en IA (§11.7) = ⛔ **PD**.
- Cumplimiento (GDPR/derecho al olvido, export) ligado a Data Export (`PD-11`) y borrado de cuenta (⛔ **PD** no diseñado).

### 12.5 Protección de imágenes
- Buckets privados; acceso solo vía URLs firmadas (expiración corta).
- Sin URLs con datos personales en query params.
- Compresión/limpieza de EXIF (geolocalización) al subir (recomendado).

### 12.6 Rate limits
- Endpoints IA (recorte, clasificación, embeddings, recomendación, clima) con límites por usuario en Edge Functions (⛔ **PD** cuotas exactas; ligadas a `PD-02` por plan).
- Protección anti-abuso en subida de imágenes (nº/tamaño por ventana).

---

## 13. Rendimiento

### 13.1 Caching
- **TanStack Query** como caché de estado servidor: `staleTime`/`gcTime` por entidad; persistencia offline del caché (AsyncStorage/MMKV en móvil).
- Preferencias de UI (densidad de vista, tema) en almacenamiento local persistente.
- Imágenes: caché en disco (Expo Image) + CDN de Supabase Storage.

### 13.2 Offline
- Lectura: servir desde caché persistido cuando no hay red.
- Escritura: **cola offline** (Zustand + persistencia) para crear prenda, favorito, mover en Studio; reintentos con backoff (§5.8).
- Captura offline: encolar imagen + procesar IA al reconectar (§3.2).

### 13.3 Optimistic Updates
- Favorito, añadir prenda, mover/rotar/capa en Studio, asignar outfit a día → aplicar en local inmediatamente y reconciliar con servidor; rollback en error.

### 13.4 Carga diferida (lazy loading)
- Rutas/pantallas con carga diferida (Expo Router / code splitting web).
- Imágenes con carga progresiva + placeholder/skeleton (visto en diseño).
- Carruseles cargan bajo demanda.

### 13.5 Compresión
- Comprimir imágenes en cliente antes de subir (redimensionar a resolución objetivo, JPEG/WebP calidad ajustada). Umbrales exactos = `PD` (proponer: lado largo ≤ 2048px, calidad ~0.8).
- Servir tamaños derivados (thumbnail/full) desde Storage.

### 13.6 Virtualización
- **Inventory** y listas largas (itinerario de viaje, bandeja de Studio, carruseles) usan listas virtualizadas (FlashList/FlatList en móvil; virtualización en web).
- Objetivo: rendimiento fluido con ≥1.000 prendas (§2.3 p95).

### 13.7 Objetivos p95 (propuestos; confirmar)
| Operación | p95 objetivo |
|---|---|
| Recorte de fondo | ⛔ **PD** (depende de proveedor) |
| Clasificación | ⛔ **PD** |
| Búsqueda semántica | < 800 ms |
| Carga inicial de Inventory (cache-warm) | < 500 ms |
| Navegación entre tabs | < 100 ms |

---

## 14. Accesibilidad (WCAG 2.2 AA)

> Base ya aplicada en el diseño corregido: `alt` reales, `:focus-visible` global, `prefers-reduced-motion`, sin `user-scalable=no`, contraste de nav corregido, targets 44px. Requisitos de implementación:

### 14.1 Perceptible
- **1.1.1** Todas las imágenes con `alt` significativo (prendas, avatares, contexto). Imágenes decorativas con `alt=""`/`aria-hidden`.
- **1.4.3 Contraste** ≥ 4.5:1 texto normal / 3:1 texto grande y UI. Verificar copys sobre imágenes con scrim sólido.
- **1.4.4 Resize/Zoom** permitido (sin `user-scalable=no`); respetar tamaño de texto del sistema (Dynamic Type).
- **1.4.11 Contraste no textual** para iconos/estados/bordes ≥ 3:1.

### 14.2 Operable
- **2.1.1 Teclado**: todos los elementos interactivos operables por teclado; convertir divs interactivos en `button`/roles (residual del Studio/nav de maqueta).
- **2.4.7 Foco visible**: `:focus-visible` 2px (design system) en todos los interactivos.
- **2.5.8 Tamaño de objetivo** ≥ 24px (y 44px por design system). Slider/handles ≥ 44px.
- **2.2.2 / 2.3.3 Movimiento**: animaciones respetan `prefers-reduced-motion`; nada parpadea > 3 veces/s.
- Drag del Studio: proporcionar **alternativa accesible** al arrastre (p. ej. seleccionar prenda → acción "añadir/mover") — ⛔ **PD** diseño de la alternativa; requisito WCAG 2.5.7 (Dragging Movements, AA 2.2).

### 14.3 Comprensible
- **3.3 Formularios** (Captura): labels visibles (`label-caps`), errores claros, campos obligatorios señalados (Category, Color).
- Idioma declarado (`lang`); textos claros.
- **3.2.6 Ayuda consistente** (si se añade ayuda, ubicación consistente) — ligado a "Photography Guide"/Help.

### 14.4 Robusto
- **4.1.2 Nombre/Rol/Valor**: nav, botones, toggles con roles/estados correctos (activo, seleccionado). Lector de pantalla anuncia el tab activo y su etiqueta.

### 14.5 Criterio de aceptación de accesibilidad (global)
- [ ] Auditoría automatizada (axe) + manual con lector de pantalla (VoiceOver/TalkBack) en las 7 pantallas sin *fails* A/AA.
- [ ] Navegación completa por teclado (web) y por lector (móvil).
- [ ] Alternativa no-drag para componer outfits (WCAG 2.5.7) — pendiente de diseño (`PD`).
