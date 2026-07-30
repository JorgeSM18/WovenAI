# 01 · Filosofía del proyecto

## 1.1 Principios (en orden de prioridad — cuando choquen, gana el de arriba)

1. **Correcto y seguro antes que rápido de escribir.** Validación en fronteras, RLS, manejo de errores y de pérdida de datos no se sacrifican nunca.
2. **Simplicidad antes que complejidad (YAGNI).** La mejor pieza de código es la que no hay que escribir. No añadir abstracción por una sola implementación, ni configuración para un valor que no cambia, ni "flexibilidad para el futuro".
3. **Reutilización antes que duplicación (DRY con criterio).** Antes de crear, buscar lo existente. Duplicar lógica de dominio o UI es un defecto, no un atajo.
4. **Composición antes que herencia.** Funciones y componentes que se componen; nada de jerarquías de clases ni herencia de componentes.
5. **Legibilidad antes que optimización prematura.** Código aburrido y claro > código listo. Optimizar solo con una medición que lo justifique.
6. **Consistencia antes que preferencia personal.** El código nuevo se parece al que lo rodea (nombres, patrones, densidad de comentarios). El estilo del proyecto gana al del agente.
7. **Límites explícitos antes que atajos.** Respetar la regla de dependencias (dominio no conoce infraestructura). Un import prohibido nunca es un atajo aceptable.

## 1.2 Valores técnicos

- **Tipado end-to-end**: tipos generados de la BD + Zod en fronteras. Los errores se descubren en `typecheck`, no en producción.
- **Offline-first cuando aplica**: lectura desde caché, escritura optimista con reconciliación.
- **Server para efectos con secretos**: la IA y terceros viven en Edge Functions, nunca en el cliente.
- **Un solo origen por cosa**: un design system, un cliente de datos, una fuente por tipo de estado. Cero duplicados de tokens, de tipos o de datos de servidor.
- **Máxima reutilización Web/Mobile**: dominio, datos, estado y UI se comparten; solo la presentación diverge lo imprescindible.

## 1.3 Decisiones ya tomadas (no re-litigar sin ADR)

- Stack: Expo/RN + React/Vite + Supabase + TanStack Query + Zustand + NativeWind/Tailwind + TypeScript estricto (TAD §2).
- Estado: servidor→TanStack Query; UI/efímero→Zustand; preferencias→Storage; local→`useState` (TAD §6).
- Design system único **Woven** (Hanken Grotesk, `primary #000000`, tokens Material-3). Nada fuera de él.
- RLS obligatoria en todas las tablas; efectos en Edge Functions.
- Un agente **no cambia** ninguna de estas decisiones; propone un ADR y espera aprobación humana.

## 1.4 Postura ante la incertidumbre

- Si falta información de producto, **no inventar**: marcar `⛔ PD` (pendiente de definición, ver PRD) y detenerse en esa parte.
- Si hay dos formas válidas del mismo tamaño, elegir la más simple y la que se parezca al código existente.
- Si algo huele a sobre-ingeniería (interfaz con una implementación, wrapper innecesario, dependencia nueva para tres líneas), **no hacerlo**.

## 1.5 Qué significa "terminado" aquí

Terminado no es "compila". Terminado es: cumple criterios de aceptación, tiene tests verdes, pasa lint/typecheck/format, respeta accesibilidad y tokens, no duplica nada existente, está documentado si cambia contrato, y revisado por un humano. Ver DoD (§16) y checklist (§17).
