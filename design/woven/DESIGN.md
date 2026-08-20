---
name: Woven
colors:
  surface: '#fdf8f7'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f1'
  surface-container: '#f1edec'
  surface-container-high: '#ece7e6'
  surface-container-highest: '#e6e1e0'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4d4540'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#7e7570'
  outline-variant: '#d0c4be'
  surface-tint: '#625d5b'
  primary: '#1c1917'
  on-primary: '#ffffff'
  primary-container: '#1e1b19'
  on-primary-container: '#888380'
  inverse-primary: '#ccc5c2'
  secondary: '#5e5e5c'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdc'
  on-secondary-container: '#636361'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1f1b17'
  on-tertiary-container: '#8a827d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9e1dd'
  primary-fixed-dim: '#ccc5c2'
  on-primary-fixed: '#1e1b19'
  on-primary-fixed-variant: '#4a4643'
  secondary-fixed: '#e4e2df'
  secondary-fixed-dim: '#c8c6c4'
  on-secondary-fixed: '#1b1c1a'
  on-secondary-fixed-variant: '#474745'
  tertiary-fixed: '#eae1da'
  tertiary-fixed-dim: '#cec5bf'
  on-tertiary-fixed: '#1f1b17'
  on-tertiary-fixed-variant: '#4b4641'
  background: '#fdf8f7'
  on-background: '#1c1b1b'
  surface-variant: '#e6e1e0'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
  # note: 'full' normalized to 9999px so pills/circles render correctly across all screens
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 80px
  touch-target-min: 44px
---

> **Nota de implementación.** La fuente de verdad de los tokens que se compilan es
> `packages/config/tailwind-preset.cjs` (bloqueada por `tailwind-preset.test.ts`). Este
> documento es el export de diseño de referencia; donde los valores difieran (p. ej. la
> escala de espaciado o de display), **manda el preset**. `primary` es charcoal `#1c1917`.

## Brand & Style
The design system is anchored in a "Premium Editorial" philosophy, positioning the interface as a quiet, sophisticated curator for lifestyle and apparel. The aesthetic prioritizes an "Invisible Interface" where the content—high-quality imagery of fabrics, textures, and locations—takes center stage, supported by a structural framework that feels like a high-end print magazine.

Drawing from **Minimalism** and **Modern Corporate** standards, the system evokes a sense of calm, organization, and timelessness. It avoids digital-first gimmicks in favor of architectural balance, generous whitespace, and a tactile, paper-like quality. The emotional response is one of intentionality and quiet luxury, mirroring the experience of browsing an artisanal boutique or a curated travel journal.

## Colors
The palette is organic and grounded, utilizing a foundation of **Ivory (#FBF9F6)** and **Charcoal (#1C1917)** to establish high-contrast readability and premium weight. **Stone** and **Sand** provide soft, mid-tone layering for containers and dividers, ensuring the UI feels warm rather than clinical.

**Sage** and **Olive** serve as functional accents for success states, active indicators, and soft highlights, reinforcing the lifestyle-focused, naturalistic identity. 

**Dark Mode Implementation:** In dark mode, the Ivory background is swapped for Charcoal, and text roles are inverted. Surface levels are defined by subtle shifts in charcoal depth (Stone-inspired darks) rather than pure black, maintaining the editorial "ink on paper" feel even in low light. All combinations must maintain a 4.5:1 contrast ratio for body text to ensure WCAG 2.2 AA compliance.

## Typography
This design system uses **Hanken Grotesk** exclusively to achieve a modern, sharp, yet approachable editorial tone. The type hierarchy relies on deliberate scale shifts and ample leading to ensure "breathability."

- **Display & Headlines:** Use tight letter-spacing and heavier weights to command attention, resembling magazine mastheads.
- **Body Text:** Set with generous line-height to maximize legibility on mobile and desktop.
- **Labels:** Small-caps are used sparingly for category headers and utility labels (e.g., "INVENTORY") to create a clear visual distinction from interactive body copy.
- **Mobile Scaling:** Large display sizes must scale down by approximately 30% on mobile devices to prevent excessive line-breaking.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a 12-column grid on desktop (max-width 1440px) and a 4-column grid on mobile. 

- **Vertical Rhythm:** Built on an 8px baseline grid to ensure alignment across all components.
- **Margins:** Generous outer margins (80px on desktop) reinforce the "premium gallery" aesthetic, pushing content into a focused center-stage position.
- **Touch Targets:** A strict minimum of 44px is maintained for all interactive elements to meet accessibility standards.
- **Reflow:** On tablet/mobile, the "Inventory" and "Trips" views transition from multi-column grids to single-column vertical stacks or horizontal carousels to preserve image aspect ratios.

## Elevation & Depth
In line with the "Invisible Interface" concept, the design system avoids heavy shadows and skeuomorphism. Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Base):** Ivory (#FBF9F6).
- **Level 1 (Cards/Inputs):** Sand (#E7E5E4) or a 1px Stone (#D6D3D1) border.
- **Level 2 (Modals/Dropdowns):** Subtle, extra-diffused ambient shadow (10% opacity Charcoal, 20px blur) to suggest a slight lift from the page.
- **Glassmorphism:** Use sparingly for global navigation bars. A 20px backdrop blur with 80% opacity Ivory allows content to peak through during scroll, creating a sense of continuity.

## Shapes
The shape language is **Soft (0.25rem)**, mirroring the subtle tailoring of quality clothing. 

- **Standard Elements:** Buttons and input fields use a 4px (0.25rem) radius for a sharp, professional look.
- **Large Containers:** Product cards and image containers use 8px (0.5rem) to feel more approachable.
- **Interactive Icons:** Circular containers are reserved for Profile avatars and specific floating action triggers.

## Components
Consistent implementation of components ensures a cohesive user experience across Home, Inventory, Outfits, Trips, and Profile.

- **Buttons:** 
  - *Primary:* Solid Charcoal with Ivory text. 44px height. No border.
  - *Secondary:* Ivory background with a 1px Stone border and Charcoal text.
- **Inputs:** Understated 1px Stone border that transitions to Sage on focus. Labels are always visible in `label-caps` style above the field.
- **Cards:** Borderless with a Sand (#E7E5E4) background or a very thin Stone outline. Images should have a consistent 3:4 or 1:1 aspect ratio.
- **Navigation Taxonomy:** 
  - A persistent Bottom Navigation bar on mobile and Top Navigation on desktop featuring: **Home, Inventory, Outfits, Trips, Profile.**
- **Motion:** 
  - *Transitions:* 300ms "Ease-In-Out" for page entries.
  - *Micro-interactions:* Subtle 2% scale-up on card hover (desktop) and soft opacity fades for state changes.
- **Accessibility:** All interactive elements must have a distinct `:focus-visible` state using a 2px Sage outline.