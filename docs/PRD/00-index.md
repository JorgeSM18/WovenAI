# Woven — Product Requirements Document (PRD)

> **Fuente de verdad del desarrollo.** Este PRD describe únicamente lo que existe en el diseño aprobado (7 pantallas Woven + `design/woven/DESIGN.md`) y el stack técnico solicitado. Todo lo que el diseño no especifica está marcado como `⛔ PENDIENTE DE DEFINICIÓN` y **no debe implementarse por suposición**.

---

## Control documental

| Campo | Valor |
|---|---|
| Producto | Woven — armario digital con IA |
| Versión PRD | 1.0 (base para desarrollo) |
| Fecha | 2026-07-28 |
| Autores (roles) | Principal PM · Staff Software Engineer · Principal Product Designer |
| Estado | Aprobado para desarrollo de MVP con pendientes marcados |
| Design System | `design/woven/DESIGN.md` (Hanken Grotesk, `primary #000000`, editorial) — **única fuente** |
| Plataformas | iOS, Android (React Native / Expo), Web (React), Tablet (responsive) |

## Entregables

| # | Archivo | Secciones PRD |
|---|---|---|
| 00 | `00-index.md` | Índice, control, glosario de estado, registro de pendientes |
| 01 | `01-vision-and-objectives.md` | 1. Visión · 2. Objetivos |
| 02 | `02-features.md` | 3. Funcionalidades (detalle completo) |
| 03 | `03-user-stories-and-flows.md` | 4. User Stories · 5. Flujos (Mermaid) |
| 04 | `04-navigation-and-data-model.md` | 6. Navegación · 7. Modelo de datos |
| 05 | `05-architecture-components-designsystem.md` | 8. Arquitectura · 9. Componentes · 10. Design System |
| 06 | `06-ai-security-performance-a11y.md` | 11. IA · 12. Seguridad · 13. Rendimiento · 14. Accesibilidad |
| 07 | `07-testing-roadmap-risks-appendix.md` | 15. Testing · 16. Roadmap · 17. Riesgos · 18. Anexos |

## Alcance del MVP (resumen ejecutivo)

El MVP cubre el bucle central del producto tal y como está diseñado:

**Onboarding → Captura (individual/ráfaga/import) → Inventario → Studio (crear outfit) → Home (uso diario) → Trips (viajes) → Profile.**

Superficies **diseñadas y en alcance**: Onboarding, Capture, Inventory, Studio/Outfits, Home, Trips, Profile.
Superficies **NO diseñadas** (fuera de MVP, marcadas pendientes donde se citen): pantallas de autenticación, community, marketplace, wearables, checkout de Premium.

## Convención de estados

| Marca | Significado |
|---|---|
| ✅ | Definido por el diseño aprobado; implementable tal cual |
| 🟡 | Parcialmente visible en el diseño; se completa con regla de negocio explícita en este PRD |
| ⛔ **PENDIENTE DE DEFINICIÓN** | El diseño no lo define. **No implementar** hasta decisión de producto |

## Registro global de `⛔ PENDIENTE DE DEFINICIÓN`

Estos puntos bloquean partes del alcance y deben resolverse con Producto antes de tocar esas áreas. Se referencian con su ID (`PD-xx`) a lo largo del documento.

| ID | Área | Qué falta | Impacto |
|---|---|---|---|
| PD-01 | Autenticación (UI) | No existe pantalla de registro/login en el diseño. Solo hay avatar y "Log Out". No está definido método (email/OAuth/Apple/Google), pantalla de sign-up ni recuperación. | Bloquea implementación de la UI de auth. La capa técnica (Supabase Auth) sí se especifica en §8/§12. |
| PD-02 | Premium / monetización | El roadmap pide "Premium" pero **no hay diseño** de paywall, tiers, precios ni límites por plan. | Bloquea cualquier gating de features y billing. |
| PD-03 | Compartir (Share) | Existen botones "Share" (Profile, Studio) sin flujo, destino ni formato de salida definidos. | Bloquea la feature de compartir. |
| PD-04 | Notificaciones | Home muestra "Pending Actions" y Trips alertas de lluvia, pero no hay especificación de push/in-app, permisos, ni triggers. | Bloquea notificaciones. |
| PD-05 | Proveedores externos | ✅ **Decidido para beta — ver ADR-016.** Clima → Open-Meteo (implementado); recorte → rembg self-hosted (pendiente); clasificación → Gemini sobre imagen recortada (implementado, requiere clave); recomendación → Gemini con metadatos; embeddings → Nomic v1.5. Regla de privacidad: la foto original con persona nunca sale a IA externa. | Desbloqueado tras interfaces (ADR-007/016). Pendiente: background removal, recomendación, embeddings + ajuste pgvector 768. |
| PD-06 | Agenda/Calendario | Home muestra "Daily Agenda" con eventos (Creative Review, Client Pitch). No se define origen (¿integración con calendario del sistema? ¿entrada manual?). | Bloquea la fuente de datos de agenda. |
| PD-07 | Datos económicos | Profile muestra "Cost Per Wear $12.40" y precio por prenda. No se define de dónde sale el precio de compra (¿entrada manual? ¿import de retailer?). | Bloquea métricas económicas. |
| PD-08 | Sostenibilidad | "Sustainability Score 84/100" sin fórmula definida. | Bloquea el cálculo del score. |
| PD-09 | "Weight Est." (Trips) | Trips muestra "18.4 kg" y "Space Remaining 22%" sin fórmula ni datos de peso/volumen por prenda. | Bloquea las métricas de maleta. |
| PD-10 | Idiomas / i18n | Profile ofrece "Language: English (UK)". No se define set de idiomas soportados en MVP. | Bloquea alcance de i18n (la arquitectura sí prevé i18n). |
| PD-11 | Data Export | Profile: "Download wardrobe metadata as JSON/PDF" sin esquema de export ni alcance. | Bloquea la feature de export. |
| PD-12 | Style Score | Home: "Style Score 84 / 70% monochromatic" sin fórmula. | Bloquea el cálculo. |

> Regla operativa: si una tarea de ingeniería toca un área con `PD-xx` sin resolver, **se detiene y se escala a Producto**; no se asume comportamiento.

## Fuentes de verdad y precedencia

1. Diseño aprobado (`design/*_final`, `home`, `inventory`, `onboarding`, `design/woven/DESIGN.md`).
2. Este PRD (reglas de negocio, criterios de aceptación, modelo de datos, arquitectura).
3. En caso de conflicto entre diseño y PRD → prevalece el diseño para UI; prevalece el PRD para lógica/datos; discrepancias se resuelven con Producto.
