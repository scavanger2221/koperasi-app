# AGENTS.md — Koperasi App

> Agent-focused guide for working on the **Koperasi Simpan Pinjam** PWA.

---

## Project Overview

A **Progressive Web App (PWA)** backoffice for a Savings & Loans Cooperative (Koperasi Simpan Pinjam).

- **Scope**: Member management, savings (simpanan), loans (pinjaman), installments (angsuran), and basic reports.
- **Primary users**: Older, non-tech-savvy backoffice staff and field officers.
- **Design philosophy**: **Function over form. Convenience over aesthetics.**

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Full-stack Framework | **TanStack Start** (Vinxi + Vite + React 19 + SSR) |
| Routing | TanStack Router (file-based) |
| API | `createServerFn` from `@tanstack/react-start` (RPC, no separate REST API) |
| Styling | Tailwind CSS 4 |
| Database | SQLite (`better-sqlite3`) |
| ORM | Drizzle ORM |
| Tables | TanStack Table v8 (desktop only) |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| PWA | `vite-plugin-pwa` |
| Icons | `lucide-react` |
| Dates | `date-fns` (locale: `id`) |

---

## Design System

### Color Code (MUST follow)
- **Green `#16a34a`**: Primary actions, savings/deposits, success states
- **Red `#dc2626`**: Loans/debt, danger actions, deletes, critical alerts
- **White `#ffffff`**: Backgrounds, cards, input fields
- **Yellow `#facc15`**: Warnings, late fees, attention flags, highlighted totals

### UX Rules
1. **Large touch targets**: minimum `48px` for buttons and inputs.
2. **Readable text**: base font `16px`, labels should be bold and clear.
3. **One action per screen** on mobile. Avoid dense multi-column forms on small screens.
4. **Forgiving UI**: always provide clear back/cancel buttons and confirmation dialogs for destructive actions.
5. **Use Indonesian plain language** in UI labels. Avoid banking jargon.

### Responsive Layout
- **Desktop (>1024px)**: Sidebar navigation + data tables (TanStack Table)
- **Tablet (768px–1024px)**: Collapsible sidebar + simplified tables
- **Mobile (<768px)**: Bottom navigation + card lists (NOT tables) + full-screen modals/drawers

Use `useIsMobile()` hook to branch layouts. Do NOT render TanStack Table on mobile.

---

## Folder Structure

```
src/
├── components/
│   ├── layout/          # DesktopSidebar, MobileNav, MobileMenu, AppTopBar
│   ├── ui/              # Modal, ConfirmDialog, MetricCard, MobileRow, etc.
│   └── LoginForm.tsx
├── db/
│   ├── client.server.ts # Drizzle client (server-only)
│   ├── schema.ts        # All table definitions
│   ├── migrations/      # Drizzle Kit output
│   └── seed.ts          # Seed script
├── hooks/
│   └── useIsMobile.ts
├── lib/
│   ├── auth.ts          # Password hashing utils
│   ├── authFns.ts       # login / getMe server functions
│   ├── membersFns.ts    # member CRUD server functions
│   ├── simpananFns.ts   # savings server functions
│   ├── pinjamanFns.ts   # loan server functions
│   ├── angsuranFns.ts   # installment server functions
│   ├── dashboardFns.ts  # dashboard stats server functions
│   ├── reportsFns.ts    # report server functions
│   └── session.server.ts # JWT-like signed session tokens
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout with auth + responsive shell
│   ├── index.tsx        # Dashboard
│   ├── anggota.tsx      # Members
│   ├── simpanan.tsx     # Savings
│   ├── pinjaman.tsx     # Loans
│   ├── angsuran.tsx     # Installments
│   └── laporan.tsx      # Reports
├── stores/
│   └── auth.ts          # Zustand auth store (persisted)
├── styles.css           # Global styles, CSS variables, utility classes
├── router.tsx           # Router setup
└── app.config.ts        # TanStack Start config (auto-generated)
```

---

## Mobile Card List Patterns

After several redesign rounds, the following patterns are **proven** for mobile card lists:

1. **Vertical stacking** — never squeeze name, badge, and action button horizontally.
2. **Full-width action buttons** — place the primary action (e.g. "Bayar", "Cairkan") at the **bottom** of the card.
3. **No text truncation** on member names — use `break-words` so names wrap naturally.
4. **Clear hierarchy** — large bold name (`16px+`), muted meta below (`13px`), details in rows, action button last.
5. **Friendly empty states** — if a chart or list has no data, show a clear message (e.g. *"Belum ada data tren untuk 6 bulan terakhir"*) instead of a broken-looking flat line.

The `angsuran.tsx` mobile list is the current reference implementation.

---

## Component Conventions

### `MetricCard`
Props: `label`, `value`, `subtext?`, `tone?`, `icon?`
- Always use **icons** and **tone backgrounds** for semantic meaning (green = savings, red = debt, yellow = attention).
- Value text is `text-xl sm:text-2xl md:text-[28px]` and bold.
- **Mobile layout:** Metric cards must be **full-width** (`grid-cols-1` on mobile) so large currency values like `Rp 5.916.666` never overflow.

### `MobileRow`
A generic collapsible row. Use it only when horizontal space is sufficient (no badge + button conflict). For complex rows, prefer a custom vertical card.

### `Modal`
Uses a bottom-sheet on mobile (`h-[92vh]`) and a centered dialog on desktop. Keep form inputs stacked vertically inside modals.

### `StatusBadge`
Small, rounded pill. Variants map to the design-system colors.

---

## Database Rules

### SQLite + Drizzle Patterns
1. **Timestamps** are stored as `integer('...', { mode: 'timestamp' })`. Drizzle serializes them as millisecond timestamps.
2. **When querying with raw SQL**, always bind numeric timestamps, never `Date` objects:
   ```ts
   // CORRECT
   const today = new Date().getTime()
   sql`${table.date} >= ${today}`

   // WRONG — causes SQLite binding errors
   sql`${table.date} >= ${new Date()}`
   ```
3. **Server-only imports**: `db/client.server.ts` and `session.server.ts` must NEVER be imported into client components. TanStack Start's import protection will block the build.
4. **Server functions** (`createServerFn`) live in `src/lib/*Fns.ts` files. These are safe to import from route components because they compile to RPC calls.

### Schema Notes
- `members.code` is unique and human-readable (e.g., `A001`).
- `pinjaman` uses **flat interest** (`bunga flat`). Total interest = principal × rate% × (tenor/12).
- `angsuran` is auto-generated when a loan is created. Late fees are calculated on payment based on `settings.late_fee_rate`.

---

## Server Function Pattern

Every protected server function follows this template:

```ts
import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { verifyPayload } from './session.server'

function verifyToken(data: { token: string }) {
  const payload = verifyPayload(data.token)
  if (!payload) throw new Error('Sesi tidak valid')
  return payload
}

export const myAction = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; ... }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    // ... business logic
  })
```

Call from components:
```ts
const result = await myAction({ data: { token, ... } })
```

---

## Adding a New Route

1. Create `src/routes/my-route.tsx`:
   ```tsx
   import { createFileRoute } from '@tanstack/react-router'
   export const Route = createFileRoute('/my-route')({ component: MyRoute })
   function MyRoute() { return <div>...</div> }
   ```
2. If using TanStack Start's file router, the route tree regenerates automatically on `npm run dev`. If not, run:
   ```bash
   npm run routes:generate
   ```
3. Add navigation link in both `DesktopSidebar.tsx` and `MobileNav.tsx` / `MobileMenu.tsx`.

---

## Adding a New Database Table

1. Add table definition to `src/db/schema.ts`.
2. Add relations if it links to existing tables.
3. Run `npm run db:generate` to create migration.
4. Run `npm run db:migrate` to apply it.
5. Create server functions in a new `src/lib/myFeatureFns.ts` file.
6. Build the UI in `src/routes/my-feature.tsx`.

---

## Common Commands

```bash
# Dev server (port 3000)
npm run dev

# Production build
npm run build

# Database
npm run db:generate   # Generate Drizzle migrations
npm run db:migrate    # Run migrations
npm run db:seed       # Seed demo data
npm run db:studio     # Drizzle Studio

# Routes
npm run routes:generate
npm run routes:watch

# TanStack CLI
npx tanstack add <add-on>
npx tanstack search-docs "loaders" --library router --framework react --json
```

---

## Auth & Demo Accounts

Auth uses signed session tokens stored in Zustand + `localStorage`.

- **admin / admin123** (role: admin)
- **teller / teller123** (role: teller)

---

## PWA Config

- Manifest: `public/manifest.json`
- Theme color: `#16a34a`
- Service worker auto-generated by `vite-plugin-pwa`
- Dev SW enabled in dev mode

---

## Deployment Notes

- This is a **TanStack Start** app. Deploy via the framework's adapters (Cloudflare, Netlify, Node, etc.).
- SQLite is a local file. For production with multiple instances, migrate to PostgreSQL by swapping the Drizzle dialect and connection string.

---

## AI / Agent Integration

**Note:** TanStack CLI's MCP server has been removed. Use direct CLI commands with `--json` output for agent introspection and automation.

```bash
# List add-ons
npx tanstack create --list-add-ons --framework React --json

# Get add-on details
npx tanstack create --addon-details drizzle --framework React --json

# Search docs
npx tanstack search-docs "server functions" --library start --json
npx tanstack doc query framework/react/overview --json

# List libraries
npx tanstack libraries --json
```
