# OLEYIA

A responsive web app for booking taxi-motos in Togo. No accounts — a single cookie remembers your role, name, phone, and license plate. Two roles, two short flows: **Customer** books a ride, **Driver** accepts one and gets paid (cash, Flooz, or T-Money).

## Stack

- **Framework:** Next.js 16 (App Router), single project for frontend + backend (route handlers)
- **Database:** PostgreSQL on [Neon](https://neon.tech) (serverless)
- **ORM:** Prisma 7
- **UI:** Tailwind CSS 4 + [Coss UI](https://coss.com/ui) (Base UI primitives)
- **Map/geo:** Leaflet + OpenStreetMap (no API key required)
- **Validation:** Zod
- **Deployment:** Vercel

## Prerequisites

- Node.js 20+
- A PostgreSQL database (a free [Neon](https://neon.tech) project works well)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` in the project root with your database connection string:

   ```bash
   DATABASE_URL="postgresql://..."
   ```

3. Apply the database schema:

   ```bash
   npx prisma migrate dev
   ```

## Development

```bash
pnpm run dev
```

Open [http://localhost:3012](http://localhost:3012).

## Other scripts

```bash
pnpm run build   # production build
pnpm run start   # run the production build
pnpm run lint    # lint the codebase
```

## Project docs

- `PRODUCT.md` — product strategy and design principles
- `DESIGN.md` — visual system (colors, typography, components)
- `docs/mvp-spec.md`, `docs/tech-stack.md`, `docs/tasks.md` — original specs (French)
