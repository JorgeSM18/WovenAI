# 04 · Estado · Componentes · UI · Accesibilidad

## 6. Estado (sin solapes — TAD §6)

### 6.1 Qué va en cada sitio
| Estado | Dónde | Ejemplos |
|---|---|---|
| **Servidor** (persistido en backend) | **TanStack Query** | prendas, outfits, viajes, colecciones, perfil, recomendaciones, clima |
| **UI / efímero** (no persistido en backend) | **Zustand** | borrador del lienzo (Studio), filtros/modo de vista, cola offline, flags de modales |
| **Preferencias persistentes** | **Storage** (MMKV/localStorage) + sync a `User` | tema, densidad por defecto, unidades, idioma |
| **Local de un componente** | `useState`/`useReducer` | inputs no confirmados, hover, toggles locales |

### 6.2 Reglas duras
- **Nunca** poner datos de servidor en Zustand (antipatrón: copiar el resultado de una query a un store "para tenerlo a mano"). Se desincroniza. Usar el hook de query donde haga falta.
- **Nunca** poner en estado global lo que es local a un componente.
- **Query keys** siempre desde `queryKeys` factory (`packages/data`), nunca strings sueltos → invalidación consistente.
- **Mutaciones**: optimistas con rollback (favorito, crear prenda, guardar outfit, mover en Studio). Invalidar las keys afectadas tras éxito.
- **Formularios**: estado local + Zod; no meter el estado del formulario en stores globales.
- **Caché**: TanStack Query (memoria + persister offline). Imágenes: Expo Image (disk) sobre CDN. No implementar cachés propias ad-hoc.

### 6.3 Decisión rápida
```
¿viene del backend y se persiste allí?        -> TanStack Query
¿es UI que se pierde al cerrar (salvo borradores)? -> Zustand
¿es preferencia que debe sobrevivir/sincronizar?   -> Storage (+ User)
¿solo importa a este componente?                -> useState
```

## 7. Componentes (Atomic Design — obligatorio)

### 7.1 Niveles
| Nivel | Qué es | Dónde |
|---|---|---|
| **Atoms** | primitivos sin dependencia (Text, Button, Chip, Input, Icon…) | `packages/ui/atoms` |
| **Molecules** | combinaciones simples (SearchBar, GarmentCard, StatCard…) | `packages/ui/molecules` |
| **Organisms** | secciones complejas (InventoryGrid, StudioCanvas, BottomNavBar…) | `packages/ui/organisms` |
| **Templates** | esqueletos de página (TabScreen, EditorTemplate, EmptyState…) | `packages/ui/templates` |
| **Pages** | pantallas que componen todo + hooks | `apps/*/app/...` |

### 7.2 Cuándo crear / reutilizar / dividir
- **Reutilizar** (por defecto): buscar en `packages/ui` un átomo/molécula que sirva o admita una prop nueva. **Preferir extender props a duplicar.**
- **Crear nuevo** solo si: (a) no existe nada equivalente, (b) no es una variante de algo existente, (c) es reutilizable (si es específico de una pantalla, va en `apps/*/.../components`, no en `ui`).
- **Dividir** cuando: un componente supera ~200 líneas, mezcla responsabilidades, o repite un bloque ≥2 veces (extraer a molécula/átomo).
- **Prohibido** duplicar un componente con cambios menores en vez de parametrizarlo (variantes por prop, no por copia).

### 7.3 Reglas de componente
- Presentacional en `ui` (sin datos). Recibe todo por props; efectos secundarios se suben a callbacks.
- Variantes por prop (`variant="primary" | "secondary"`), no por componentes separados.
- Cada componente de `ui`: story en Storybook + snapshot visual + test de accesibilidad.

## 8. UI y tokens (Design System — innegociable)

- **Prohibido crear componentes visuales fuera del Design System.** Todo primitivo visual vive en `packages/ui` y usa tokens.
- **Prohibidos colores hardcodeados.** Usar tokens Woven (`bg-primary`, `text-on-surface`, `border-outline-variant`…). Nunca `#000`, `rgb(...)`, `text-[#123]`.
- **Prohibidos tamaños/espaciados hardcodeados.** Usar la escala (`p-md`, `gap-sm`, `rounded-xl`, `text-headline-md`). Nunca `p-[13px]`, `mt-[7px]`.
- **Prohibidas tipografías fuera de escala.** Solo estilos definidos (display-lg, headline-md, title-sm, body-lg/md, label-caps) en **Hanken Grotesk**.
- **Iconos**: Material Symbols Outlined del set definido; nombres válidos (p. ej. `auto_fix_high`, no `auto_fix`).
- **Radios**: tokens (`rounded-full` = pill/círculo; `rounded-xl` contenedores). No inventar valores.
- **Dark mode**: usar tokens que ya resuelven claro/oscuro; **prohibido** codificar colores por tema a mano.
- Excepción única: valores realmente únicos y justificados con comentario (`// one-off: …`) y aprobados en review; por defecto, **no**.

## 9. Accesibilidad (WCAG 2.2 AA — obligatorio por componente)

Ningún componente se da por terminado sin esto:
- **Texto alternativo**: toda imagen con `alt`/`accessibilityLabel` significativo; decorativas con `alt=""`/`accessibilityElementsHidden`. **Prohibido `data-alt`** (usar `alt`).
- **Labels**: inputs con label asociado (`label-caps`); iconos-acción con `aria-label`/`accessibilityLabel`; nav con etiquetas.
- **Roles/estado**: elementos interactivos son `Button`/`Pressable`/`<button>` con rol y estado (`selected`, `disabled`) correctos. **Prohibido** `div`/`View` con `onClick`/`onPress` sin rol ni foco.
- **Teclado (web)**: todo operable por teclado; orden de tabulación lógico.
- **Foco visible**: `:focus-visible` (2px) presente; no eliminar outlines sin sustituto.
- **Contraste**: texto ≥ 4.5:1 (grande 3:1), UI/iconos ≥ 3:1. Texto sobre imagen con scrim sólido.
- **Target táctil** ≥ 44px (design system) / mínimo 24px (WCAG 2.5.8).
- **Movimiento**: respetar `prefers-reduced-motion`; nada parpadea > 3×/s; contenido en movimiento > 5s tiene pausa.
- **Zoom**: nunca `user-scalable=no` ni `maximum-scale=1`.
- **Alternativa al arrastre** (Studio): toda acción de drag tiene alternativa accesible (WCAG 2.5.7).
- Verificación: `axe` (web) en CI + revisión con VoiceOver/TalkBack por feature.
