# 01 · Visión del producto y Objetivos

## 1. Visión del producto

### 1.1 Problema

Las personas con guardarropas cuidados no tienen una forma sistemática de **saber qué poseen, combinarlo y usarlo bien**:

- La ropa se olvida: prendas de calidad quedan sin usar porque no se recuerdan al vestirse.
- Vestirse a diario es fricción cognitiva: clima, agenda y contexto no se cruzan con el armario real.
- Preparar un viaje es manual y propenso a olvidos (falta una capa impermeable, outfits incompletos por día).
- Catalogar el armario manualmente es tedioso, lo que hunde a las apps de la categoría (coste de arranque / *cold-start*).

### 1.2 Oportunidad

- La **eliminación de fondo + clasificación automática por IA** reduce el coste de catalogar cada prenda a "hacer una foto".
- Tres vías de alta (individual, ráfaga, import de galería) atacan directamente el *cold-start*.
- Cruzar **inventario + clima + agenda + viaje** convierte un catálogo estático en una utilidad diaria (razón de retorno).
- El posicionamiento **editorial premium** (Hanken Grotesk, marfil/carbón) diferencia frente a apps utilitarias frías.

### 1.3 Propuesta de valor

> **Woven es tu armario digital con IA: fotografías tu ropa, la IA la recorta y clasifica, y luego te ayuda a crear outfits, vestirte cada día según tu contexto y preparar tus viajes sin olvidos.**

Pilares (todos respaldados por pantallas aprobadas):
1. **Cataloga sin esfuerzo** — Capture con recorte + auto-etiquetado editable.
2. **Encuentra y organiza a escala** — Inventory con búsqueda semántica, colecciones y 3 densidades.
3. **Crea outfits** — Studio (lienzo táctil) con asistencia de estilista IA.
4. **Vístete cada día** — Home con "Today's Look" según clima y agenda, y "Forgotten Pieces".
5. **Viaja preparado** — Trips con maleta visual, outfits por día y avisos de clima.
6. **Conócete** — Profile con preferencias de estilo y analíticas del armario.

### 1.4 Público objetivo

Basado en el tono y contenido del diseño aprobado (prendas de marcas premium: Loro Piana, Theory, Common Projects, Celine, Sunspel; viajes tipo Milán/París; lenguaje "quiet luxury"):

- **Primario:** adultos 25–45 con guardarropa cuidado de gama media-alta, sensibles al diseño, que viajan y valoran organización y estética.
- **Secundario:** entusiastas de moda/estilo que quieren registrar, combinar y sacar más partido a lo que ya tienen.
- ⛔ **PENDIENTE DE DEFINICIÓN (PD):** segmentación cuantitativa, mercados/geografías objetivo y buyer personas formales no están en el diseño.

### 1.5 Diferenciación

| Frente a… | Diferencial de Woven (respaldado por diseño) |
|---|---|
| Apps de armario utilitarias | Dirección editorial premium + IA integrada (no chatbot). |
| Galerías de fotos genéricas | Recorte de fondo + clasificación estructurada (categoría/color/material/estación/estilo) + búsqueda semántica. |
| Pinterest/moodboards | Los outfits se construyen con **tu inventario real**, con match-score y detección de conflicto de texturas. |
| Listas de viaje manuales | Maleta visual + outfits por día + avisos de clima + estado "outfit incompleto". |

---

## 2. Objetivos

### 2.1 Objetivos del MVP

1. Permitir dar de alta un armario con **fricción mínima** (3 vías de captura) y clasificación asistida por IA editable.
2. Ofrecer un **inventario escalable** (búsqueda, colecciones, 3 densidades) usable con cientos de prendas.
3. Permitir **crear y guardar outfits** en el Studio táctil.
4. Ofrecer un **Home diario** con Today's Look (clima+agenda) y Forgotten Pieces.
5. Permitir **planificar un viaje** con maleta visual y outfits por día.
6. Ofrecer **Profile** con preferencias de estilo y ajustes de cuenta.
7. Cumplir **WCAG 2.2 AA** y ser fluido en móvil (plataforma principal).

### 2.2 Objetivos de negocio

- Validar retención (uso diario) del bucle Home ↔ Inventory ↔ Studio.
- Validar que la captura asistida elimina el *cold-start* (usuarios que superan N prendas en la primera sesión).
- Preparar la base para Premium (arquitectura lista) — **el modelo de negocio concreto es `PD-02`.**
- ⛔ **PD:** objetivos de ingresos, CAC/LTV y funnel de conversión no están definidos.

### 2.3 Métricas y KPIs

> Los umbrales concretos (*targets*) son `PD` salvo indicación; aquí se definen **qué medir** para que ingeniería instrumente eventos desde el día 1.

**Activación**
- % usuarios que completan onboarding y añaden ≥1 prenda.
- Nº de prendas añadidas en la primera sesión (proxy anti *cold-start*).
- Tasa de éxito de recorte de fondo (aceptado sin retomar).

**Engagement / Retención**
- DAU/WAU/MAU; retención D1/D7/D30.
- Frecuencia de apertura de Home; % días con "Today's Look" consultado.
- Outfits creados por usuario / semana.
- Uso de búsqueda semántica (queries/usuario).

**Feature health**
- Prendas por usuario (mediana) y crecimiento.
- % prendas con etiquetas auto-aceptadas vs editadas (precisión percibida de IA).
- Viajes creados; % días de viaje con outfit asignado.
- CTR de "AI NUDGE" / "Apply Suggestion" del Studio.

**Calidad técnica**
- p95 de latencia de: recorte de fondo, clasificación, búsqueda, carga de Inventory.
- Crash-free sessions ≥ 99.5% (target propuesto; confirmar).
- Cobertura de tests (ver §15).

### 2.4 Criterios de éxito (del MVP)

- El bucle completo (onboarding→captura→inventario→outfit→home→viaje→perfil) es operable end-to-end en iOS y Android sin errores bloqueantes.
- Un usuario nuevo puede catalogar ≥20 prendas en una sesión mediante Burst/Import.
- Auditoría WCAG 2.2 AA sin *fails* de nivel A/AA en las pantallas de alcance.
- ⛔ **PD:** *targets* numéricos de negocio (retención, conversión) para declarar éxito.
