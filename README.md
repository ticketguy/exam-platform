# Nocho — Frontend A (Mock / Design Sandbox)

> **Branch:** `frontend-a-mock`
> **Purpose:** Design sandbox — no database or external services needed
> **Backend:** In-memory (resets on server restart)

Use this branch to build and test **Design A** frontend changes. All data is mocked in memory so you can focus purely on UI without any backend setup.

---

## Quick Start

```bash
npm install
cp .env.example .env   # or create .env manually (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env` file with just two values:

```env
NEXTAUTH_SECRET=any-string-works-for-dev
NEXTAUTH_URL=http://localhost:3000
```

No database, no API keys, no external services needed.

## Demo Accounts (pre-seeded in memory)

| Role  | Email           | Password | Login URL               |
| ----- | --------------- | -------- | ----------------------- |
| Admin | admin@nocho.ng  | admin123 | `/idokosafehouse/login` |
| User  | demo@nocho.ng   | demo123  | `/login`                |

Data resets every time the dev server restarts — this is by design.

## Hidden Admin Panel

- **Access:** `/idokosafehouse` (not `/admin`)
- Direct `/admin` access returns 404

## What This Branch Is For

This is a **design-only sandbox**. Make UI changes, test layouts, and iterate on Design A here freely. When a design is approved, port the changes to:

- `frontend-a-liveprod` — production branch (PostgreSQL + Prisma + DGB wallet)

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | Next.js 14 (App Router)             |
| Language   | TypeScript 5                        |
| Styling    | Tailwind CSS 4                      |
| Auth       | NextAuth 4 (in-memory store)        |
| State      | Zustand (localStorage)              |
| Backend    | Next.js API routes (no external DB) |

## Scripts

| Command         | Description            |
| --------------- | ---------------------- |
| `npm run dev`   | Start dev server       |
| `npm run build` | Production build check |
| `npm run lint`  | Run ESLint             |