<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Taxi-Moto MVP

Responsive web app for booking taxi-motos in Togo. No accounts — session (role, name, phone, license plate) is stored in a single cookie (`lib/session.ts`). Two roles, two short flows: **Customer** books a ride, **Driver** accepts one and gets paid (cash, Flooz, T-Money).

- Specs (French): `docs/mvp-spec.md`, `docs/tech-stack.md`, `docs/tasks.md` — task list to implement against.
- **Docs are French. All code, identifiers, and the DB schema are English** (`Customer`, `Driver`, `Ride`, `RideStatus`, `PaymentMethod` — see `prisma/schema.prisma`).
- DB: Prisma 7 + Neon Postgres. Client singleton at `lib/prisma.ts`. Schema/datasource config lives in `prisma.config.ts` (Prisma 7 moved datasource URL out of `schema.prisma`), not the schema file.

## Design system — read before any UI work

- `PRODUCT.md` and `DESIGN.md` at the project root are the source of truth for product strategy and the visual system. Read both before building or changing any screen.
- North star: "The Local Dispatch" — Gozem's confident sun-yellow primary, disciplined by Uber Eats' clean restraint. Pure white ground, near-black ink, no SaaS cream/beige, no fintech-dashboard density.
- Color tokens are wired in `app/globals.css` (OKLCH, shadcn/coss CSS variable convention: `--primary`, `--secondary`, `--muted`, `--destructive`, plus a custom `--brand-accent` reserved for status signals only — see DESIGN.md's "One Signal Rule").

## UI library: Coss UI — use it first

This project uses **Coss UI** (https://coss.com/ui, built on Base UI) as its component library, installed through the shadcn CLI registry — **not** plain shadcn/Radix defaults.

- Install primitives with `npx shadcn@latest add @coss/<component>` (registry already configured in `components.json`).
- Before building any non-trivial UI piece (dialogs, forms, selects, menus, toasts, etc.), consult the `coss` skill at `.claude/skills/coss/`: start from `references/component-registry.md` to pick the right primitive, then read that primitive's guide at `references/primitives/<name>.md` before writing markup.
- Prefer composing existing coss primitives over hand-rolled markup. Use the `render` prop (Base UI composition, e.g. `<Button render={<Link href="..." />}>`) instead of any `asChild`-style mental model.
- Do not run `npx shadcn@latest add @coss/style` or `init @coss/style` — it would overwrite this project's already-committed DESIGN.md color/font tokens with Coss's own defaults.
