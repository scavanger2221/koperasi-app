# Koperasi Simpan Pinjam

A Progressive Web App (PWA) backoffice for a Savings & Loans Cooperative (Koperasi Simpan Pinjam).

Built for **older, non-tech-savvy backoffice staff and field officers**. The UI prioritizes **function over form**, **clarity over density**, and **forgiveness over speed**.

[![Deploy to GitHub](https://img.shields.io/badge/GitHub-scavanger2221%2Fkoperasi--app-blue)](https://github.com/scavanger2221/koperasi-app)

---

## Features

- **Member Management** (Anggota) — register, edit, activate/deactivate members
- **Savings** (Simpanan) — record deposits and withdrawals by member
- **Loans** (Pinjaman) — create loans, approve and disburse funds
- **Installments** (Angsuran) — view generated installments, record payments with late-fee auto-calculation
- **Reports** (Laporan) — filterable reports for savings, loans, installments, and arrears
- **Responsive Dashboard** — at-a-glance stats, 6-month trend chart, and overdue alerts

---

## Quick Start

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`.

### Demo Accounts

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | admin |
| teller   | teller123| teller|

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (Vinxi + Vite + React 19 + SSR) |
| Router | TanStack Router (file-based) |
| API | `createServerFn` RPC |
| Styling | Tailwind CSS 4 |
| Database | SQLite (`better-sqlite3`) |
| ORM | Drizzle ORM |
| Tables | TanStack Table v8 (desktop only) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| PWA | `vite-plugin-pwa` |
| Icons | `lucide-react` |
| Dates | `date-fns` (locale: `id`) |

---

## Common Commands

```bash
# Dev server
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
```

---

## Deployment

This is a TanStack Start app. Deploy via the framework's adapters (Cloudflare, Netlify, Node, Docker, etc.).

> **Note:** SQLite is a local file. For production with multiple instances, migrate to PostgreSQL by swapping the Drizzle dialect and connection string.

---

## Design Philosophy

- **Minimum 48px touch targets** everywhere
- **Base 16px font** with bold, clear labels
- **One action per screen** on mobile
- **Plain Indonesian** — no banking jargon
- **Desktop:** sidebar + data tables
- **Mobile:** bottom nav + full-width card lists (no tables)

---

## License

MIT
