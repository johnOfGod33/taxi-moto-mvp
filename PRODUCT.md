# Product

## Register

product

## Users

Two roles, no account creation:
- **Clients** — passengers in Togo who need a fast, no-friction way to book a taxi-moto from wherever they are to a destination. They use this on mobile, often in motion, sometimes on a weaker connection.
- **Conducteurs (drivers)** — taxi-moto drivers who want to receive nearby ride requests, accept or decline them, and get paid at the end (cash, Flooz, or T-Money).

Job to be done: get a ride booked/accepted in as few taps as possible. No login, no clutter — the cookie-based "remember me" replaces an account.

## Product Purpose

A responsive web app (no install) that matches clients with nearby available drivers for taxi-moto rides. Client picks a destination on a map, sees an estimated price/ETA, confirms, and is matched with the closest available driver. Driver toggles availability, accepts/declines incoming requests, and collects payment at the end of the ride. Success = a booked ride completed in under a minute of interaction, on a low-end phone.

## Brand Personality

**Reliable, fast, locally confident.**

References:
- **Gozem** — for color: bold, sun-yellow energy that reads as local and confident, not generic tech-startup color.
- **Uber Eats** — for layout discipline: clean, épuré, generous whitespace, strong but simple typographic hierarchy, restrained use of cards/imagery.

The brand should feel like a punchy, trustworthy local service — not a global SaaS dashboard.

## Anti-references

- Generic SaaS cream/beige minimalism (the "AI default" look).
- Fintech-dashboard density/complexity — this is a 2-minute task, not a back-office tool.
- Decorative flourishes (gradients, glassmorphism, illustrations) that don't serve speed or clarity.

## Design Principles

1. **Speed over decoration** — every screen is optimized for completing the task fast, on mobile, on a possibly slow connection.
2. **Bold color, disciplined layout** — Gozem's confident yellow, applied with Uber Eats' restraint (one accent color carrying real weight, not scattered everywhere).
3. **No-account simplicity reinforced visually** — the UI should never feel like it's asking for more than it needs.
4. **Local-first tone** — French copy, West African context (Flooz/T-Money, taxi-moto), not a translated global template.
5. **Clarity at every step** — price, ETA, and driver/client identity must always be unambiguous and legible at a glance.

## Accessibility & Inclusion

- WCAG AA contrast minimum across all text/UI.
- Low-bandwidth friendly: no heavy hero images, no costly animations; motion is purposeful and respects `prefers-reduced-motion`.
- Large tap targets (≥44px) for one-handed mobile use, often while walking/in traffic.
- French only for the MVP (no i18n needed yet).
