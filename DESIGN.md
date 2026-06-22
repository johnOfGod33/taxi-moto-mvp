---
name: Taxi-Moto MVP
description: Réservation rapide de taxi-moto au Togo — sans compte, sans friction.
colors:
  primary: "oklch(0.80 0.17 95)"
  primary-foreground: "oklch(0.17 0.01 90)"
  bg: "oklch(1.00 0.00 0)"
  surface: "oklch(0.965 0.008 95)"
  ink: "oklch(0.17 0.01 90)"
  muted: "oklch(0.55 0.01 90)"
  accent: "oklch(0.45 0.13 150)"
  accent-foreground: "oklch(1.00 0.00 0)"
  destructive: "oklch(0.55 0.22 25)"
  destructive-foreground: "oklch(1.00 0.00 0)"
  border: "oklch(0.90 0.005 95)"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "oklch(0.76 0.18 95)"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  status-pill-available:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: Taxi-Moto MVP

## 1. Overview

**Creative North Star: "The Local Dispatch"**

This is a dispatch tool, not a storefront: someone needs a ride in the next sixty seconds, on a phone, on the move. The system borrows Gozem's confident sun-yellow — a color that already means "taxi-moto" in this market — and disciplines it with Uber Eats' restraint: pure white ground, generous breathing room, one color doing real work instead of five colors doing none. Nothing here is decorative; every choice optimizes for "book a ride fast, on a possibly slow connection."

This system explicitly rejects the generic SaaS cream/beige look and fintech-dashboard density. There is no warm-tinted near-white background, no card-on-card nesting, no dashboard full of secondary metrics. Two roles, two short flows: book a ride, accept a ride.

**Key Characteristics:**
- Pure white ground, sun-yellow primary carrying real visual weight (not a thin 10% accent)
- Near-black ink, no soft gray-on-white body text
- Pill-shaped, high-confidence touch targets sized for one-handed, in-motion use
- Flat by default — no shadows standing in for hierarchy
- One animation register: responsive feedback, never choreography

## 2. Colors

**Strategy: Committed.** The sun-yellow primary is the system's signature and carries a meaningful share of any booking screen (primary CTA, active states, role selection) — but the canvas stays pure white so the yellow has somewhere to land.

### Primary
- **Sun Dispatch Yellow** (`oklch(0.80 0.17 95)`): The single color that means "this app." Used on the primary CTA ("Confirmer la course", "Accepter"), the selected role card, and any state that says "this is the main action here." Pairs with near-black text (`primary-foreground`), never white — at this lightness, white text washes out.

### Accent
- **Dispatch Green** (`oklch(0.45 0.13 150)`): Reserved for "go" states only — driver "disponible," a ride just "acceptée." It is not a second decorative brand color; it is a status signal. White text on this fill.

### Neutral
- **Pure Ground** (`oklch(1.00 0.00 0)`): The page background, always. No warm or cool tint — the warmth lives in the yellow, not the canvas.
- **Quiet Surface** (`oklch(0.965 0.008 95)`): The one step up from ground, used for the map panel backing, the bottom-sheet/modal body, and secondary buttons. Barely perceptible as a separate surface; it's there to separate, not to decorate.
- **Near-Black Ink** (`oklch(0.17 0.01 90)`): All body text and primary-button text. Never a lighter "elegant" gray.
- **Muted** (`oklch(0.55 0.01 90)`): Secondary text only — timestamps, helper copy under a field, the driver's plate number under their name. Must still clear AA at this weight; if a string needs to be read at a glance (price, ETA), it is Ink, not Muted.
- **Border** (`oklch(0.90 0.005 95)`): Hairline dividers and input outlines. Never used as a decorative colored stripe.

### Destructive
- **Refuse Red** (`oklch(0.55 0.22 25)`): "Refuser" actions only — declining a ride request. White text.

### Named Rules
**The One Signal Rule.** Yellow means "primary action." Green means "available / accepted." Red means "refuse." No screen uses a fourth color for anything that isn't one of these three signals plus near-black ink on white.

## 3. Typography

**Display Font:** Geist (with `system-ui, sans-serif` fallback) — already wired into the project via `next/font`.
**Body Font:** Geist, same family, different weights.

**Character:** One geometric/technical sans, multiple weights, no second family. The pairing is the absence of a pairing — consistent with Uber Eats' restraint and a fast load on weak connections (one variable font, no serif import).

### Hierarchy
- **Display** (600, `clamp(1.875rem, 4vw, 2.75rem)`, 1.1): Screen titles — "Où allez-vous ?", the estimated price callout, the driver-assigned headline.
- **Title** (600, 1.25rem, 1.2): Section/card titles — driver name on the confirmation card, "Demandes à proximité."
- **Body** (400, 1rem, 1.5): Form labels, addresses, copy. Max ~65ch where prose appears (rare here).
- **Label** (500, 0.8125rem, 1.3): Button text, status pills, field hints. Never uppercase-tracked as a default decorative eyebrow — used only where it labels a real control.

### Named Rules
**The No-Eyebrow Rule.** Labels are for controls and status, not decorative section kickers. No small-caps tracked text floating above a heading "for polish."

## 4. Elevation

Flat by default. Depth is conveyed through the Ground → Surface step (a 3.5% lightness drop, no shadow) and through borders, not through drop shadows. The one exception is the confirmation modal/bottom sheet, which needs to visually separate from the map behind it.

### Shadow Vocabulary
- **Modal Lift** (`box-shadow: 0 8px 24px oklch(0.17 0.01 90 / 0.16)`): Used only on the ride-confirmation modal and any sheet floating over the map. Nowhere else.

### Named Rules
**The Flat-By-Default Rule.** Cards, buttons, and inputs at rest never carry a shadow. Shadow appears exactly once in the system — under a floating modal — never paired with a border.

## 5. Components

Buttons and pills feel tactile and immediate: large, pill-shaped, no ambiguity about what's tappable. Cards are used sparingly — only for the driver-profile reveal and the ride-request list, never nested.

### Buttons
- **Shape:** Full pill (`border-radius: 999px`).
- **Primary:** Sun Dispatch Yellow background, Near-Black Ink text, `14px 24px` padding, 600-weight label. Used for exactly one action per screen.
- **Secondary / Ghost:** Quiet Surface background, Ink text, same shape/padding — for "Annuler," "Modifier," back actions.
- **Hover / Focus:** Hover darkens the fill ~5% (`oklch(0.76 0.18 95)` for primary). Focus-visible adds a 2px Near-Black Ink ring offset 2px — never relies on color shift alone.

### Status Pills (signature component)
- **Style:** Pill shape, `4px 12px` padding, Label typography. "Disponible" / "Acceptée" use Dispatch Green fill + white text; "Indisponible" / "Refusée" use a Quiet Surface fill + Muted text (not Refuse Red — red is reserved for the refuse action itself, not the resulting state label).

### Cards / Containers
- **Corner Style:** 16px radius (`rounded.lg`).
- **Background:** Quiet Surface on Pure Ground, or Pure Ground with a 1px Border on Quiet Surface — pick one per context, never both.
- **Shadow Strategy:** None (see Elevation). The modal variant uses Modal Lift.
- **Internal Padding:** 16–24px (`spacing.md`–`spacing.lg`).

### Inputs / Fields
- **Style:** Quiet Surface fill, no visible border at rest, 12px radius.
- **Focus:** Border shifts to Near-Black Ink at 2px, no glow.
- **Error:** Border shifts to Refuse Red, helper text below in Refuse Red, Label weight.

### Navigation
- No persistent nav bar — each role has one linear flow (home → form → main screen), so wayfinding is a back action, not a nav system. The role-selection screen is the only "choice" surface in the app.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page background Pure Ground (`oklch(1 0 0)`) on every screen — the yellow only works against true white.
- **Do** use Near-Black Ink for any text that must be read at a glance (price, ETA, plate number).
- **Do** size every tappable target at minimum 44px, pill-shaped, with generous horizontal padding for one-handed mobile use.
- **Do** respect `prefers-reduced-motion`: all "responsive" transitions (button press, toggle, status change) collapse to an instant state change.

### Don't:
- **Don't** use a warm cream/beige/sand background — that is the generic SaaS-default look this project explicitly rejects.
- **Don't** build fintech-dashboard density: no secondary metrics, no multi-column data tables, no settings sprawl. This is a two-minute task tool.
- **Don't** pair a 1px border with a soft wide drop shadow on the same element ("ghost card"). Pick border or shadow, never both as decoration.
- **Don't** use border-radius above 16px on cards/sections/inputs — pills (999px) are reserved for buttons, chips, and status labels.
- **Don't** add a gradient, glassmorphism panel, or illustrated mascot anywhere — none of these serve speed or clarity, and they cost bytes on a low-bandwidth connection.
- **Don't** use Refuse Red for anything other than the "Refuser" action and its resulting error states.
