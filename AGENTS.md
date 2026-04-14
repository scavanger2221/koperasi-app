# AGENTS.md — Koperasi App

> Agent-focused guide for working on the **Koperasi Simpan Pinjam** PWA.

---

## Project Overview

A **Progressive Web App (PWA)** backoffice for a Savings & Loans Cooperative (Koperasi Simpan Pinjam).

- **Scope**: Member management, savings (simpanan), loans (pinjaman), installments (angsuran), and basic reports.
- **Primary users**: Older, non-tech-savvy backoffice staff and field officers.
- **Design philosophy**: **Modern Koperasi Aesthetic**. Trustworthy, clean, and high-performance. Prioritize clarity and community trust over generic enterprise density. Strictly **"Anti-Slop"** (no messy gradients, no blurry shadows).

---

## Agent Instructions

- When the instruction is clear, don't overthink. If it doesn't make sense, ask the user first.

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

### Color Code (MODERN KOPERASI)
- **Primary Forest Green `#064e3b`**: Branding, primary buttons, active navigation, trust.
- **Vibrant Mint `#10b981`**: Accents, tiny highlights, success indicators.
- **Crimson Red `#be123c`**: Danger actions, deletes, critical debt/arrears alerts.
- **Slate Text `#0f172a`**: High contrast for readability, easier on eyes than pure black.
- **Slate Border `#e2e8f0`**: Hairline borders for all structural separation (no blurry shadows).
- **Background Slate-50 `#f8fafc`**: Clean, off-white background for reduced glare.

### UX Rules (FOR NON-TECH USERS)
1. **Large touch targets**: minimum `44px`–`48px` for all clickable areas.
2. **Softened Flat Geometry**: Use `6px` (sm) and `8px` (md) border-radius. Avoid 0px (too harsh) and large curves (too "bubbly").
3. **Labels Everywhere**: Never show icon-only buttons in tables. Every action button (Aksi) must have a **clear text label** (e.g., "UBAH", "BAYAR").
4. **Bold Financial Data**: All currency and numbers must be **bold**, large, and use **tabular numbers** (`font-variant-numeric: tabular-nums`).
5. **No Slop**: Absolutely no gradients or fuzzy drop shadows. Use crisp hairline borders and tight, hard shadows for floating elements.
6. **Indonesian Plain Language**: Use "Ubah" instead of "Edit", "Simpan" instead of "Save", "Keluar" instead of "Logout".

### Responsive Layout
- **Desktop (>1024px)**: Fixed Sidebar + Header + Data Tables with labeled actions.
- **Mobile (<768px)**: Bottom Navigation + Vertical Card Lists + Bottom Sheets (Modals).

Use `useIsMobile()` hook to branch layouts. Do NOT render complex tables on mobile; use `EntityCard`.

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
- **Modern Starkness**: Pure white bg, crisp borders (`border-border`), bold tabular-nums.
- **Tone Highlights**: Use subtle background tints from the Modern Koperasi palette (Emerald-50, Rose-50, Amber-50) for icons.
- **Visual Weight**: Values should be `text-2xl sm:text-3xl` and `font-extrabold`.

### `IconButton`
- **Mandatory Labels**: In desktop tables, always set `showLabel={true}`.
- **Precise Borders**: Always has a shadow-sm and a hairline border for better tactile feedback.
- **Friendly Colors**: Green-dark for primary, Slate for ghost actions.

### `Modal`
- **Depth**: Uses `bg-slate-900/40` backdrop with subtle blur. 
- **Animations**: Uses TanStack Router-style animations (`animate-in fade-in slide-in-from-bottom`).
- **Responsive Shape**: Rounded top corners (`rounded-t-2xl`) on mobile (bottom-sheet style); centered with `rounded-xl` on desktop.

### `StatusBadge`
- **Modern Pills**: Large, rounded-full pills with bold, uppercase text.
- **Semantic Mapping**: Mapped precisely to color palette (Forest Green for paid, Crimson for unpaid).

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
npm run dev           # Dev server
npm run build         # Production build
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:seed       # Seed demo data
npm run routes:generate
```

---

## Debugging Rules

### Trust the Stack Trace
When a React component throws with a clear line number, **fix it there first**. Do not spiral into checking the database schema, generating fake tokens, or curling `createServerFn` RPC endpoints unless the stack trace points to a server file.

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

Use the TanStack CLI with `--json` for machine-readable docs when needed.
