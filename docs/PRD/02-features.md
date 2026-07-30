# 02 · Funcionalidades

Formato por funcionalidad: **Descripción · Objetivo · Flujo · Reglas de negocio · Validaciones · Casos límite · Criterios de aceptación (CA)**.
Todo se basa en las 7 pantallas aprobadas. Lo no diseñado se marca `⛔ PD`.

Índice: [3.1 Onboarding](#31-onboarding) · [3.2 Captura](#32-captura) · [3.3 Inventario](#33-inventario) · [3.4 Studio](#34-studio) · [3.5 Outfits](#35-outfits) · [3.6 IA](#36-ia) · [3.7 Viajes](#37-viajes-trips) · [3.8 Perfil](#38-perfil) · [3.9 Sincronización](#39-sincronización) · [3.10 Autenticación](#310-autenticación) · [3.11 Configuración](#311-configuración)

---

## 3.1 Onboarding

**Descripción.** Pantalla de bienvenida (`onboarding_woven_2.0`) con hero ("Your collection starts here"), enlace "Skip for now", y **tres tarjetas de entrada**: *Capture Individual*, *Burst Mode*, *Import from Gallery*; más una tarjeta de consejo de fotografía IA ("View Photography Guide").

**Objetivo.** Eliminar el *cold-start*: llevar al usuario a empezar a catalogar con la mínima fricción, dejándole elegir el ritmo.

**Flujo.**
1. Usuario llega tras autenticarse (`PD-01`) o como primer arranque.
2. Ve hero + 3 opciones + consejo.
3. Selecciona una opción → navega al flujo de Captura en el modo correspondiente (Photo / Burst / Import).
4. Alternativamente pulsa "Skip for now" → entra a la app en estado vacío (Inventory/Home vacíos).

**Reglas de negocio.**
- Las 3 tarjetas son mutuamente excluyentes como punto de entrada, pero el usuario puede volver y usar otra vía en cualquier momento (FAB "add" existe en Home/Inventory).
- "Skip for now" no crea prendas; deja el armario vacío. El estado vacío de Inventory/Home debe mostrar CTA para capturar.
- El onboarding se muestra **solo la primera vez** (o hasta que exista ≥1 prenda). 🟡 Regla: se marca `has_completed_onboarding` en `User`; no volver a mostrarlo salvo reset.
- "View Photography Guide" abre guía de fotografía. ⛔ **PD:** contenido y destino de la guía (¿pantalla interna? ¿enlace?).

**Validaciones.** Ninguna entrada de datos en esta pantalla.

**Casos límite.**
- Usuario sin permiso de cámara/galería: al elegir una opción que lo requiera, solicitar permiso; si lo deniega, mostrar estado explicativo (ver §3.2).
- Usuario reincidente que ya tiene prendas: no mostrar onboarding; ir a Home.

**CA.**
- [ ] Se muestran exactamente 3 opciones con sus copys y navegan al modo correcto de Captura.
- [ ] "Skip for now" entra a la app con estado vacío y CTA de captura.
- [ ] El onboarding no reaparece cuando `has_completed_onboarding = true` o hay ≥1 prenda.
- [ ] Cumple accesibilidad (foco, etiquetas, contraste) §14.

---

## 3.2 Captura

**Descripción.** Flujo de 3 etapas (`capture_woven_final`):
1. **Cámara** (full-screen): selector de modo `PHOTO · BURST · IMPORT`, controles flash/HDR, botón galería, disparador, voltear cámara, botón cerrar.
2. **Procesado IA**: "Refining Canvas / AI background isolation in progress" con animación de escaneo/máscara (recorte de fondo).
3. **Revisión y refinado**: cabecera con miniatura recortada + chip "AI DETECTED: TOPS"; campos editables **Category** (select), **Color** (swatches), **Material** (tags + "+ Add"), **Season** (select), **Style** (select); botón **Confirm & Add to Wardrobe**; sugerencia IA ("perfect match for your Linen Trousers").

**Objetivo.** Convertir una foto en una prenda estructurada del inventario con recorte y clasificación asistida, editable por el usuario.

**Flujo (modo PHOTO).**
```
Cámara → disparo → Procesado IA (recorte) → Revisión (auto-tags editables) → Confirm → Prenda creada en Inventory
```
**Modo BURST.** Varias fotos en secuencia; el recorte/clasificación se procesan en cola en segundo plano; el usuario revisa/confirma en lote. 🟡 El diseño muestra el modo en el selector y lo describe en onboarding ("we'll handle the sorting and background removal later").
**Modo IMPORT.** Selección múltiple desde galería; escaneo de fotos con prendas; import en lote. 🟡 Igual que Burst en cuanto a procesamiento diferido.

**Reglas de negocio.**
- Cada captura genera **1 `Garment`** con al menos: imagen original (`ImageAsset` original) + imagen recortada (`ImageAsset` processed) + atributos clasificados.
- La IA propone: **category, color(es), material(es), season, style**. Todos **editables** antes de confirmar (campos presentes en la etapa 3).
- "Confirm & Add to Wardrobe" persiste la prenda y la asocia al usuario.
- La sugerencia IA de la etapa 3 ("matches your Linen Trousers") es informativa; "View Suggestion" navega a crear/ver outfit. 🟡 Destino exacto: abrir Studio con ambas prendas precargadas.
- BURST/IMPORT: las prendas quedan en estado `processing` hasta que el recorte/clasificación terminan; luego pasan a `review` o directamente a `active` según decisión de UX. 🟡 Regla propuesta: en lote, se crean como `active` con tags provisionales editables desde el detalle; se notifica al terminar.

**Validaciones.**
- Category: obligatorio (no permitir Confirm sin categoría). Valor por defecto = el detectado.
- Color: ≥1 seleccionado (default = detectado).
- Material, Season, Style: opcionales pero con default detectado; editables.
- Imagen: debe existir imagen recortada válida; si el recorte falla, ver casos límite.
- Tamaño/formato de imagen: ver §13 (compresión) — validar tipo (JPEG/PNG/HEIC) y tamaño máximo (`PD` umbral exacto; proponer 20 MB pre-compresión).

**Casos límite.**
- **Recorte falla / baja confianza:** permitir usar la imagen original sin recorte y marcar la prenda para reintentar recorte; nunca bloquear la creación.
- **Sin conexión:** permitir capturar y encolar; recorte/clasificación se ejecutan al recuperar red (ver §13 offline). La prenda aparece con placeholder hasta procesar.
- **Permiso de cámara/galería denegado:** pantalla explicativa con acceso a ajustes del sistema.
- **Objeto no reconocido como prenda (IMPORT):** la IA puede descartar fotos sin ropa; mostrar cuáles se importaron y cuáles se omitieron.
- **Foto con múltiples prendas:** ⛔ **PD** — el diseño asume 1 prenda por foto; no está definida la separación multi-prenda.
- **Retomar ("RETAKE"):** descarta la captura actual y vuelve a cámara sin crear prenda.

**CA.**
- [ ] Los 3 modos (Photo/Burst/Import) son accesibles desde el selector.
- [ ] Tras el disparo se ejecuta el recorte y se muestra la etapa de revisión con los 5 campos editables prellenados por IA.
- [ ] No se puede confirmar sin Category y ≥1 Color.
- [ ] "Confirm & Add to Wardrobe" crea la `Garment` y aparece en Inventory.
- [ ] Si el recorte falla, se puede crear la prenda con la imagen original.
- [ ] Captura offline se encola y procesa al recuperar conexión.
- [ ] Burst/Import procesan en lote y notifican al finalizar.

---

## 3.3 Inventario

**Descripción.** Pantalla `inventory_woven_2.0_scalable`: **búsqueda semántica** (placeholder "Find something for a rainy dinner"), **colecciones** en scroll horizontal (All Items, Essentials, Evening Wear, Work Uniform, Travel Essentials, Summer '24), cabecera ("Your Inventory · 248 items organized by context"), **3 modos de vista** (Editorial / Compact / Categories), **tarjeta de Insight IA** ("You have 12 items for 'Rainy Dinner'… I've curated a new collection 'Dusk Essentials'"), rejilla de prendas (categoría, nombre, color • marca, botón favorito), **FAB add**.

**Objetivo.** Encontrar, organizar y visualizar el armario a escala (cientos de prendas) sin perder legibilidad.

**Flujo.**
1. Usuario abre Inventory (tab).
2. Ve colecciones + rejilla en modo por defecto (Editorial).
3. Puede: buscar (semántico), filtrar por colección (chip), cambiar densidad (Editorial/Compact/Categories), marcar favorito, abrir una prenda (detalle), añadir (FAB → Captura).

**Reglas de negocio.**
- **Búsqueda semántica**: interpreta lenguaje natural ("rainy dinner") y devuelve prendas relevantes usando los atributos/emb!eddings (ver §11). 🟡 Comportamiento: busca sobre category/color/material/season/style/brand/name y semántica.
- **Colecciones**: son agrupaciones nombradas de prendas. "All Items" = todo. Las demás son colecciones del usuario o **generadas por IA** (p. ej. "Dusk Essentials" creada por la Insight card). Un `Garment` puede pertenecer a varias `Collection`.
- **Modos de vista** (JS del diseño define comportamiento):
  - *Editorial*: rejilla 1→4 col con tarjeta grande (categoría, nombre, color•marca), imagen `object-contain`.
  - *Compact*: rejilla 2→8 col, imagen cuadrada, solo nombre (oculta metadatos).
  - *Categories*: lista agrupada; ⛔ **PD** el criterio de agrupación exacto (por categoría se asume).
- **Contador**: "248 items organized by context" = total de prendas activas del usuario.
- **Favorito**: marca/desmarca `is_favorite` en `Garment`.
- **FAB**: abre Captura (modo Photo por defecto).
- **Insight card**: puede proponer y crear una colección; "View Collection" navega a ella (filtro aplicado).

**Validaciones.**
- Búsqueda: acepta texto libre; vacía = mostrar todo. Longitud máx `PD` (proponer 200 chars).
- Cambio de vista: persistir preferencia de densidad por usuario/dispositivo (§13 caching).

**Casos límite.**
- **Inventario vacío** (usuario que hizo Skip): estado vacío con CTA de captura, sin rejilla.
- **Búsqueda sin resultados**: estado vacío específico ("nada coincide") con sugerencia de limpiar filtros.
- **Miles de prendas**: virtualizar la rejilla (§13). Editorial/Compact deben mantener rendimiento p95 (§2.3).
- **Prenda en `processing`** (recorte pendiente): mostrar placeholder/skeleton hasta que la imagen recortada esté lista.
- **Colección vacía**: mostrar estado vacío de esa colección.

**CA.**
- [ ] Los 3 modos de vista cambian la densidad de la rejilla y persisten la preferencia.
- [ ] La búsqueda semántica devuelve resultados relevantes por atributos + lenguaje natural.
- [ ] Filtrar por chip de colección restringe la rejilla a esa colección.
- [ ] Favorito persiste y se refleja al recargar.
- [ ] FAB abre Captura.
- [ ] Estado vacío y "sin resultados" están cubiertos.
- [ ] La rejilla está virtualizada y cumple p95 con ≥1.000 prendas.

---

## 3.4 Studio

**Descripción.** `outfits_woven_final` (editor "The Studio / Outfit Creator"): **lienzo** con rejilla de puntos, **prendas arrastrables** (soporte táctil), **burbuja de estilista IA** ("Texture clash detected: Silk & Wool"), **AI Match Score (94%)**, **controles de capa** (layers, rotate) por prenda, **paleta de herramientas** (grid/organizar, auto_awesome/IA, delete), **bandeja de armario colapsable** (chips All/Tops/Bottoms/Shoes/Outerwear + búsqueda + filtro + rejilla para arrastrar), cabecera **close · "The Studio" · undo/redo · Save Outfit**.

**Objetivo.** Crear un outfit combinando prendas del inventario sobre un lienzo, con asistencia de estilista IA, y guardarlo.

**Flujo.**
```
Abrir Studio (nuevo o editar) → abrir bandeja de armario → arrastrar prendas al lienzo →
recolocar/capa/rotar → (IA sugiere ajustes / muestra match score) → Save Outfit → Outfit persistido
```

**Reglas de negocio.**
- El lienzo contiene **referencias a `Garment`** posicionadas (x, y, z-index/capa, rotación, escala).
- **Arrastrar desde la bandeja** añade la prenda al lienzo; **arrastrar en el lienzo** reposiciona (táctil). 🟡 El drag actual del diseño es un *simulador*; ver §8/§13 para DnD real.
- **Capas (layers)**: reordena z-index; **rotate**: gira la prenda. Persistir en el `OutfitItem`.
- **Match Score (94%)**: puntuación IA de coherencia del outfit (ver §11). Se recalcula al cambiar el conjunto.
- **Estilista IA**: emite avisos contextuales (p. ej. "texture clash", "add loafers"). "Apply Suggestion" añade la prenda sugerida al lienzo.
- **undo/redo**: historial de acciones del editor (añadir, mover, capa, rotar, borrar). undo deshabilitado si no hay historial (el diseño ya muestra `undo` deshabilitado).
- **delete** (paleta): elimina la prenda seleccionada del lienzo (no del inventario).
- **Save Outfit**: crea/actualiza un `Outfit` con sus `OutfitItem`s. 🟡 Requiere ≥1 prenda para guardar.
- **Filtros de bandeja**: All/Tops/Bottoms/Shoes/Outerwear filtran por categoría; búsqueda y filtro adicionales disponibles.

**Validaciones.**
- Save: outfit debe tener ≥1 prenda. Nombre de outfit: ⛔ **PD** (el diseño no muestra campo de nombre) — proponer nombre opcional; default autogenerado.
- No permitir dos instancias de la misma prenda solapadas de forma inválida: 🟡 se permite repetir prenda (decisión de UX), sin bloqueo.

**Casos límite.**
- **Lienzo vacío al pulsar Save**: bloquear con mensaje.
- **Prenda borrada del inventario** referenciada por un outfit: ver §3.5 (mantener snapshot o marcar como no disponible).
- **Rendimiento con muchas prendas** en el lienzo: limitar/rendir eficientemente (`PD` límite máximo de items por outfit; proponer 20).
- **Conflictos de IA** (texture clash) no bloquean guardar; son informativos.
- **Interrupción** (cierra la app): 🟡 autosave de borrador del lienzo (§13 optimistic/offline) — `PD` confirmar si hay borradores.

**CA.**
- [ ] Se pueden arrastrar prendas desde la bandeja al lienzo con gestos táctiles (iOS/Android) y con puntero (web).
- [ ] Reposicionar, cambiar capa y rotar prendas funciona y persiste al guardar.
- [ ] undo/redo cubren add/move/layer/rotate/delete.
- [ ] Match Score se muestra y actualiza al cambiar el conjunto.
- [ ] "Apply Suggestion" añade la prenda propuesta.
- [ ] Save Outfit persiste un `Outfit` con posiciones; bloquea si el lienzo está vacío.

---

## 3.5 Outfits

**Descripción.** Entidad y gestión de **outfits guardados**. La *creación/edición* ocurre en el Studio (§3.4). El tab "Outfits" abre el Studio.

> ⛔ **PD:** No existe en el diseño una **galería/lista de outfits guardados** como pantalla propia. Los outfits guardados se referencian desde Home ("Today's Look"), Trips (outfits por día) y la sugerencia de Captura, pero **no hay pantalla de listado diseñada**. Se marca pendiente el diseño de "Mis outfits".

**Objetivo.** Persistir, reutilizar y asignar outfits (a días de viaje, a "look del día").

**Reglas de negocio (de la entidad, ver §7).**
- Un `Outfit` = conjunto de `OutfitItem` (prenda + posición/capa/rotación) + metadatos (nombre opcional, creado, match score, ocasión). 🟡
- Un outfit puede **asignarse a un día de un viaje** (Trips) y aparecer como "Today's Look" (Home). 🟡
- Reutilizable en múltiples contextos (viaje, home) sin duplicarse.

**Casos límite.**
- **Prenda de un outfit eliminada del inventario:** el outfit debe seguir siendo válido → mantener referencia con estado "prenda no disponible" o snapshot de imagen. 🟡 Regla propuesta: soft-delete de `Garment` (§7); el outfit muestra la prenda como "archivada".

**CA.**
- [ ] Un outfit guardado en Studio es recuperable y editable.
- [ ] Un outfit puede asignarse a un día de viaje y mostrarse como Today's Look.
- [ ] Eliminar una prenda no rompe outfits que la usan.
- [ ] ⛔ Diseño de "Mis outfits" pendiente antes de implementar su listado.

---

## 3.6 IA

Ver documento **06 · IA** para el detalle técnico. Resumen funcional (todas respaldadas por pantallas):

| Capacidad | Dónde aparece | Estado |
|---|---|---|
| Eliminación de fondo | Captura etapa 2 | ✅ funcional / `PD-05` proveedor |
| Clasificación (category/color/material/season/style) | Captura etapa 3 | ✅ / `PD-05` |
| Búsqueda semántica | Inventory | ✅ / `PD-05` |
| Generación/coherencia de outfits (Match Score, texture clash, sugerencias) | Studio | ✅ / `PD-05` |
| "Forgotten Pieces" (no usadas 60+ días) + AI NUDGE | Home | ✅ (regla temporal) |
| Insight/colecciones automáticas ("Dusk Essentials") | Inventory | ✅ |
| Packing Insight (clima→prenda) | Trips | ✅ / `PD-05` clima |
| Wardrobe Whispers | Profile | ✅ |
| Style Score / Sustainability Score / Cost Per Wear | Home/Profile | 🟡 fórmulas `PD-08/PD-12/PD-07` |

---

## 3.7 Viajes (Trips)

**Descripción.** `trips_woven_final`: cabecera de viaje (destino "Paris, France", fechas, clima "14°C, Cloudy"), **Weight Est. (18.4 kg)** + **Space Remaining (22%)**, **AI Packing Insight** ("might rain on Tuesday… add your charcoal raincoat"), **Visual Suitcase** (rejilla de prendas + "Add Item"), **Daily Outfits** (itinerario 7 días con miniaturas de outfit por día; día lluvioso con estado **"Outfit Incomplete"**), **Journey Blueprint** (mapa + "7 Outfits · 14 Items · 2 Spare Sets"), **FAB add**.

**Objetivo.** Planificar el equipaje y los outfits de un viaje según destino, fechas y clima, evitando olvidos.

**Flujo.**
```
Crear viaje (destino + fechas) → clima cargado → añadir prendas a la maleta / asignar outfit por día →
IA avisa (clima, huecos) → maleta lista (blueprint)
```

**Reglas de negocio.**
- Un `Trip` = destino + rango de fechas + snapshot(s) de clima + prendas de maleta + outfits por día.
- **Clima**: se obtiene por destino y fechas (`WeatherSnapshot`, ver §7/§11). Puede ser por día (el diseño muestra alerta "Tuesday"). 🟡 Regla: guardar snapshot por día del viaje.
- **Daily Outfits**: cada día del rango tiene 0..1 outfit asignado. Estado **"Outfit Incomplete"** cuando el día tiene condición relevante (lluvia) y el outfit no cubre el requisito (falta capa impermeable). 🟡
- **Packing Insight**: si el clima esperado requiere una prenda ausente en la maleta, la IA lo sugiere ("Add to Trip").
- **Weight Est. / Space Remaining**: ⛔ **PD-09** — no hay datos de peso/volumen por prenda ni fórmula. **No implementar el cálculo**; mostrar solo si `PD-09` se resuelve.
- **Journey Blueprint** ("7 Outfits · 14 Items · 2 Spare Sets"): resumen agregado de la planificación. "Spare Sets" = ⛔ **PD** definición exacta.
- **Mapa de destino**: contexto visual. ⛔ **PD-05** proveedor de mapas.

**Validaciones.**
- Crear viaje: destino obligatorio, fecha inicio ≤ fecha fin, duración > 0. ⛔ **PD** límites (máx días).
- Asignar outfit a día: el outfit debe existir; un día admite máx 1 outfit (más "spare"?) — `PD`.

**Casos límite.**
- **Clima no disponible** para el destino/fecha: mostrar viaje sin datos de clima y sin Packing Insight climático.
- **Viaje en el pasado / en curso:** ⛔ **PD** — el diseño solo muestra "Next Journey"; estados histórico/activo no definidos.
- **Rango largo (p. ej. 30 días):** rendimiento del itinerario (virtualizar la lista de días).
- **Día sin outfit:** estado vacío "Add Outfit".
- **Prenda de maleta eliminada del inventario:** ver regla de soft-delete (§7).

**CA.**
- [ ] Crear un viaje con destino y fechas válidas carga clima (si disponible).
- [ ] Se pueden añadir prendas a la maleta y asignar un outfit por día.
- [ ] La IA sugiere prendas ausentes según el clima (Packing Insight) con acción "Add to Trip".
- [ ] Un día con requisito no cubierto muestra "Outfit Incomplete".
- [ ] Weight Est./Space Remaining **no se implementan** hasta resolver `PD-09`.

---

## 3.8 Perfil

**Descripción.** `profile_woven_final`: cabecera (avatar, nombre "Julian Thorne", email, **Edit Profile**, **Share**), **Wardrobe Analytics** (Sustainability Score 84/100, Cost Per Wear $12.40, Total Items 142), **Style Preferences** (chips eliminables: Minimalist, Tailored, Monochromatic, Tech-wear + "Add Tag"), **Wardrobe Whispers** (insights IA), **Account Settings** (Preferences, Units & Sizing, Language, Cloud Sync, Privacy & Security, Data Export), **Log Out**.

**Objetivo.** Gestionar identidad, preferencias de estilo, analíticas del armario y ajustes de cuenta.

**Flujo.** Ver/editar perfil; añadir/quitar tags de estilo; abrir cada ajuste; cerrar sesión.

**Reglas de negocio.**
- **Style Preferences**: lista de tags de estilo del usuario; editable (añadir/quitar). Alimentan recomendaciones IA (§11).
- **Total Items**: recuento de prendas activas (coincide con Inventory).
- **Cost Per Wear**: ⛔ **PD-07** (precio de compra por prenda no definido). **No calcular** hasta resolver.
- **Sustainability Score**: ⛔ **PD-08** (fórmula no definida). **No calcular** hasta resolver.
- **Edit Profile**: editar nombre, avatar, email. ⛔ **PD** alcance exacto de campos editables.
- **Share**: ⛔ **PD-03** (sin flujo definido).
- **Cloud Sync**: refleja estado de sincronización ("Last synced: 2 minutes ago") — ver §3.9.
- **Log Out**: cierra sesión (Supabase Auth), limpia estado local sensible.

**Validaciones.**
- Email: formato válido (si editable).
- Style tags: sin duplicados; longitud/num máximo `PD`.

**Casos límite.**
- **Sin conexión**: Cloud Sync muestra estado pendiente; edición local con sync diferido.
- **Eliminar todas las prendas**: Total Items = 0; analíticas en estado vacío.

**CA.**
- [ ] Se pueden añadir/quitar Style Preferences y persisten.
- [ ] Total Items coincide con Inventory.
- [ ] Log Out cierra sesión y limpia estado local.
- [ ] Cost Per Wear y Sustainability Score **ocultos o vacíos** hasta resolver `PD-07/PD-08`.
- [ ] Share y Edit Profile marcados según `PD-03`/alcance.

---

## 3.9 Sincronización

**Descripción.** Sincronización de datos e imágenes entre dispositivos vía backend (Supabase). Reflejada en Profile ("Cloud Sync · Last synced").

**Objetivo.** Que el armario esté disponible y consistente en todos los dispositivos del usuario, con soporte offline.

**Reglas de negocio.**
- Fuente de verdad remota: Supabase (Postgres + Storage). Cliente cachea localmente (§13).
- **Escrituras optimistas** (crear prenda, favorito, mover en Studio) se aplican localmente y se sincronizan; en conflicto, **last-write-wins por `updated_at`** salvo entidades con reglas específicas. 🟡
- **Imágenes**: se suben a Storage; el cliente referencia por URL/keys (`ImageAsset`).
- **Offline**: cola de operaciones pendientes; se reintenta al recuperar red (§13).
- Estado "Last synced" = timestamp de la última sincronización exitosa.

**Validaciones.** Integridad referencial en backend (FKs, RLS §12).

**Casos límite.**
- **Conflicto de edición** en dos dispositivos: resolución last-write-wins; ⛔ **PD** si se requiere merge más fino para outfits.
- **Fallo de subida de imagen**: reintento con backoff; prenda queda en `processing`/`pending_upload`.
- **Cuota de almacenamiento**: ⛔ **PD-02** (límites por plan).

**CA.**
- [ ] Cambios hechos offline se sincronizan al recuperar conexión.
- [ ] Un cambio en el dispositivo A aparece en el dispositivo B tras sync.
- [ ] Las imágenes se suben y se referencian correctamente.
- [ ] El estado "Last synced" se actualiza tras cada sync.

---

## 3.10 Autenticación

**Descripción.** Identidad del usuario. En el diseño solo existen **avatar** y **Log Out**; **no hay pantallas de registro/login/recuperación**.

> ⛔ **PD-01** — UI de autenticación **no diseñada**. Método (email/contraseña, magic link, Apple, Google), pantallas de sign-up/login/reset y verificación **no definidos**. **No implementar UI de auth** hasta decisión de Producto.

**Objetivo.** Autenticar de forma segura y asociar todos los datos al usuario.

**Reglas de negocio (capa técnica, definida en §12).**
- Backend: **Supabase Auth**. Cada usuario ↔ `auth.users.id`, reflejado en tabla `User` (perfil).
- Toda entidad de datos pertenece a un `user_id` y se protege con **RLS** (§12).
- Log Out invalida la sesión local y remota.

**Casos límite / CA.** Dependen de `PD-01`; los CA de UI quedan bloqueados. CA técnicos:
- [ ] Sin sesión válida, no hay acceso a datos (RLS deniega).
- [ ] Log Out revoca la sesión y limpia tokens locales.

---

## 3.11 Configuración

**Descripción.** Sección **Account Settings** de Profile: **Preferences** (Notifications, Dark Mode, Accessibility), **Units & Sizing** (Metric, International Sizing), **Language** (English (UK)), **Cloud Sync**, **Privacy & Security** (FaceID, Privacy mode, Blocked brands), **Data Export** (JSON/PDF).

**Objetivo.** Permitir al usuario configurar app, privacidad, unidades y datos.

**Reglas de negocio (por ítem).**
- **Preferences → Notifications**: ⛔ **PD-04** (sistema de notificaciones no especificado).
- **Preferences → Dark Mode**: el design system contempla dark mode (§10). 🟡 Toggle claro/oscuro/sistema.
- **Preferences → Accessibility**: ⛔ **PD** ajustes concretos (más allá de respetar `prefers-reduced-motion`, tamaño de texto del sistema — §14).
- **Units & Sizing**: unidades métricas/imperiales y tallas internacionales. ⛔ **PD** catálogo de sistemas de tallas.
- **Language**: ⛔ **PD-10** set de idiomas.
- **Cloud Sync**: ver §3.9.
- **Privacy & Security**: FaceID/biometría para abrir la app; "Privacy mode"; "Blocked brands". ⛔ **PD** definición exacta de "Privacy mode" y "Blocked brands".
- **Data Export**: ⛔ **PD-11** esquema y alcance del export (JSON/PDF).

**CA.**
- [ ] Dark Mode conmuta el tema (claro/oscuro/sistema) y persiste.
- [ ] Cada ajuste con `PD` queda **inhabilitado o marcado "próximamente"** hasta su definición.
- [ ] La app respeta `prefers-reduced-motion` y el tamaño de texto del sistema (§14).
