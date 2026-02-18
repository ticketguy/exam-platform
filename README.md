# Nocho — Competitive Exam Platform

A competitive knowledge-testing platform where users take exams, compete on leaderboards, and earn DigiByte (DGB) rewards. Built with Next.js 14, PostgreSQL, and Prisma.

---

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 14 (App Router)                   |
| Language       | TypeScript 5                              |
| Styling        | Tailwind CSS 4                            |
| Authentication | NextAuth 4 (JWT strategy)                 |
| Database       | PostgreSQL + Prisma 7 (driver adapter)    |
| Email          | Resend (transactional verification emails)|
| Blockchain     | DigiByte RPC (with mock mode fallback)    |
| State          | Zustand (client-side persistence)         |
| Validation     | Zod                                       |
| Font           | Inter (via next/font)                     |

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **PostgreSQL** 14+ (local or hosted — Supabase, Neon, Railway, etc.)
- **npm** (comes with Node.js)
- **DigiByte Core** (optional — only needed if `DGB_MODE=live`)
- **Resend account** (optional — email verification skipped if key is empty)

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd exam-platform
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 3. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# 4. Seed the database (creates admin account + demo data)
npx prisma db seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# ─── Database ───────────────────────────────────────────────
# PostgreSQL connection string. Use ?sslmode=require in production.
DATABASE_URL="postgresql://user:password@localhost:5432/nocho?schema=public"

# ─── NextAuth ───────────────────────────────────────────────
# Random secret for JWT signing. Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="generate-a-secure-random-string-here"

# The canonical URL of your deployment (no trailing slash)
NEXTAUTH_URL="http://localhost:3000"

# ─── Email (Resend) ────────────────────────────────────────
# API key from https://resend.com. Leave empty to skip sending
# (verification URLs will be logged to console in dev mode).
RESEND_API_KEY=""

# ─── DigiByte RPC ───────────────────────────────────────────
# Connection to a DigiByte Core node. Set DGB_MODE=live for real
# blockchain operations, or DGB_MODE=mock for development.
DGB_RPC_HOST="localhost"
DGB_RPC_PORT="14022"
DGB_RPC_USER="digibyte"
DGB_RPC_PASS=""
DGB_MODE="mock"
DGB_CONFIRMATIONS_REQUIRED="6"
```

### Required vs Optional

| Variable                    | Required | Notes                                       |
| --------------------------- | -------- | -------------------------------------------- |
| `DATABASE_URL`              | Yes      | PostgreSQL connection string                 |
| `NEXTAUTH_SECRET`           | Yes      | Must be random, min 32 characters            |
| `NEXTAUTH_URL`              | Yes      | Your domain in production                    |
| `RESEND_API_KEY`            | No       | Email skipped if empty (dev mode logs URLs)  |
| `DGB_RPC_HOST`              | No       | Only needed when `DGB_MODE=live`             |
| `DGB_RPC_PORT`              | No       | Default: 14022                               |
| `DGB_RPC_USER`              | No       | Default: digibyte                            |
| `DGB_RPC_PASS`              | No       | Only needed when `DGB_MODE=live`             |
| `DGB_MODE`                  | No       | `mock` (default) or `live`                   |
| `DGB_CONFIRMATIONS_REQUIRED`| No       | Default: 6                                   |

## Demo Accounts

Created by the seed script (`npx prisma db seed`):

| Role  | Email           | Password | Login URL               |
| ----- | --------------- | -------- | ----------------------- |
| Admin | admin@nocho.ng  | admin123 | `/idokosafehouse/login` |
| User  | demo@nocho.ng   | demo123  | `/login`                |

**Change these passwords in production.** The seed is for initial setup only.

## Project Structure

```
app/
├── (admin)/admin/              # Admin panel (hidden behind /idokosafehouse)
│   ├── (dashboard)/            # Admin dashboard pages
│   │   ├── deposits/           # Deposit management
│   │   ├── exams/              # Exam CRUD + results
│   │   ├── settings/           # Platform settings + admin management
│   │   ├── transactions/       # Transaction history
│   │   └── withdrawals/        # Withdrawal management
│   └── login/                  # Admin login
├── (auth)/                     # Auth pages (login, register)
├── (user)/                     # User pages
│   ├── dashboard/              # User dashboard
│   ├── exams/                  # Exam list, take exam, results
│   ├── leaderboard/            # Rankings
│   ├── profile/                # Profile management
│   ├── settings/               # User settings
│   └── wallet/                 # Wallet + transactions
├── api/
│   ├── auth/[...nextauth]/     # NextAuth handler
│   └── v1/                     # API routes
│       ├── admin/              # Admin endpoints (protected)
│       ├── auth/               # Register, login, verify email
│       ├── exams/              # Exam listing, start, submit, result
│       ├── internal/           # DGB polling + withdrawal processing
│       ├── leaderboard/        # Leaderboard data
│       ├── users/me/           # User profile + notifications
│       ├── waitlist/           # Waitlist signup
│       └── wallet/             # Wallet balance + withdraw
└── page.tsx                    # Landing page

lib/
├── auth.ts                     # NextAuth configuration
├── auth-helpers.ts             # requireUser(), requireAdmin()
├── dgb-rpc.ts                  # DigiByte RPC client
├── email.ts                    # Resend email (lazy-initialized)
├── prisma.ts                   # Prisma client singleton (PrismaPg adapter)
├── rate-limit.ts               # In-memory rate limiter
├── settings.ts                 # Platform settings helpers
├── validation.ts               # Zod schemas
├── users.ts                    # Legacy (unused in production)
└── wallet-service.ts           # Wallet operations

middleware.ts                   # Route protection + admin slug rewriting
prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Seed script (admin + demo data)
```

## Hidden Admin Panel

The admin panel is **not** accessible at `/admin`. It uses a secret URL slug:

- **Access:** `/idokosafehouse` (rewrites internally to `/admin`)
- **Direct `/admin` access** returns 404
- Admin login at `/idokosafehouse/login`
- All admin routes require `role: "admin"` in the JWT
- Regular users attempting admin URLs get redirected to `/dashboard`

## Scripts

| Command                        | Description                          |
| ------------------------------ | ------------------------------------ |
| `npm run dev`                  | Start dev server (Turbo mode)        |
| `npm run build`                | Production build                     |
| `npm start`                    | Start production server (port 3000)  |
| `npm run lint`                 | Run ESLint                           |
| `npx prisma generate`         | Generate Prisma client               |
| `npx prisma migrate deploy`   | Run pending migrations               |
| `npx prisma db seed`          | Seed database with initial data      |
| `npx prisma studio`           | Open Prisma database GUI             |

## Production Deployment

A one-command deployment script is included:

```bash
# First deployment
bash deploy.sh

# Or with a custom port
PORT=8080 bash deploy.sh
```

The script handles: dependency install, Prisma generate, migrations, build, and starts the server. See `deploy.sh` for details.

For detailed security review, see [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md).

## Key Features

- **Competitive exams** with entry fees, prize pools, and time limits
- **DigiByte wallet** integration (deposits, withdrawals, balance tracking)
- **Leaderboard** rankings across all users
- **Email verification** via Resend
- **Admin panel** for exam management, user finances, and platform settings
- **Rate limiting** on auth and financial endpoints
- **Security headers** (HSTS, X-Frame-Options, CSP-ready)
- **Waitlist mode** toggle for controlled launches