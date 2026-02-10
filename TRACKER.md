# Nocho Exam Platform — Project Tracker

> Living document. Updated as work progresses.
> Last updated: 2026-02-10

---

## Tech Decisions

| Layer      | Choice                                         |
| ---------- | ---------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, Tailwind 4 |
| Backend    | FastAPI (Python) — learning as we go           |
| Auth       | NextAuth 4 (JWT, Credentials)                  |
| State      | Zustand (localStorage persistence)             |
| Database   | TBD                                            |
| Design     | Dark theme, glass-morphism, same color palette  |

## Core Concept — Exam Arena

Nocho uses an **Arena** model for competitive exams:

- **Exam Arena** — the main hub where users browse and enter exams. Each arena has an entry fee and a potential prize pool.
- **Active Exams** — exams the user is currently participating in within the arena.
- **Upcoming** — exams scheduled to start soon in the arena.
- **Arena Board** — leaderboard specific to the arena the user is in (per-exam rankings).
- **Global Board** — overall platform leaderboard across all arenas (accessible via Quick Access).

Users pay an entry fee to join an arena exam, compete, and win from the prize pool.

---

## Color Palette (Keeping)

| Token             | Value           | Usage                          |
| ----------------- | --------------- | ------------------------------ |
| Brand Red         | `#8B1E1E`       | Primary buttons, accents, CTAs |
| Dark Red          | `#8B2E2E`       | Logo backgrounds, links        |
| Gradient End      | `#250808`       | Gradient cards                 |
| Background        | `#0a0a0a`       | Page background (dark mode)    |
| Slate Base        | `#0F172A`       | Alt dark background            |
| Glass White       | `#ffffff10`     | Glass cards                    |
| Glass Border      | `#ffffff20`     | Card borders                   |
| Muted Text        | `#aaa`          | Labels, secondary text         |
| Input BG (light)  | `#d3d3d3c2`     | Auth form inputs               |
| Success           | `green-400/500` | Available, confirmed, positive |
| Warning           | `yellow-500/600`| Pending states                 |
| Error             | `red-500/600`   | Negative amounts, errors       |
| Info BG           | `#FFF7ED`       | Info alerts (light orange)     |

---

## Done (Working Correctly)

- [x] **NextAuth setup** — JWT strategy, credentials provider, role in token/session
- [x] **Route protection middleware** — guards user/admin routes, redirects by role
- [x] **User login page** — form submits via `signIn()`, redirects to `/dashboard`
- [x] **Admin login page** — form submits with `userType: "admin"`, redirects to `/admin`
- [x] **SessionProvider** — wraps app correctly in root layout
- [x] **NextAuth type augmentations** — role on User, Session, JWT
- [x] **User Sidenav** — responsive sidebar, active states, dynamic page titles, hides nav during live exams
- [x] **Admin Shell** — responsive sidebar, session display, logout
- [x] **Live exam engine** — timer countdown, question navigation, answer selection, score calculation, auto-submit
- [x] **Exam start page** — confirmation page with warnings before entering exam
- [x] **Exam details page** — prize distribution table, entry fee, breadcrumb nav
- [x] **User settings page** — reads real session data, logout via `signOut()` works
- [x] **Admin exam results page** — search, filter, sort, CSV export, stats calculations (client-side)
- [x] **Admin deposits page** — search, filter, detail modals, manual credit UI, CSV export
- [x] **Admin withdrawals page** — approve/deny/retry/block UI, detail modals, CSV export
- [x] **Admin transactions page** — ledger view, filter by type/trigger, CSV export
- [x] **Admin create exam page** — form with question builder, preview mode, validation
- [x] **Admin edit exam page** — loads mock data, full editing UI
- [x] **OverViewCard component** — reusable stats card with icon/title/value
- [x] **`.env.local` created** — `NEXTAUTH_SECRET` and `NEXTAUTH_URL` set

---

## Mocked / Hardcoded (Needs Real Backend)

### User Portal

| Page / Feature          | What's Fake                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| **Dashboard**           | Wallet balance (`₦12,500`), stats (24 exams, 8 consecutive), timer static  |
| **Exams list**          | Single hardcoded exam, `userExamStatus` hardcoded to `"not_registered"`     |
| **Exam details**        | Prize pool (`₦50,000`), entry fee (`₦50`), wallet balance (`₦2,500`)       |
| **Live exam questions** | 20 generic questions ("This is question X..."), all correct answers = "A"   |
| **Results page**        | Shows literal "UserName", leaderboard is 7 static users, rank is random    |
| **Wallet**              | Balance (`₦12,500`), 4 static transactions, fake deposit address           |
| **Leaderboard**         | 7 hardcoded users, no scores, static participant count                      |

### Admin Portal

| Page / Feature           | What's Fake                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| **Dashboard**            | All stats from `mockStats`, 5 static transactions, DGB status hardcoded   |
| **Exams management**     | Single hardcoded exam, static stats (234 attempts, 68% pass rate)         |
| **Edit exam**            | Loads `mockExistingExam`, changes don't persist                           |
| **Results**              | `mockResults` array with 6 students                                       |
| **Deposits**             | 5 mock deposits, credit/reverse actions are alerts only                   |
| **Withdrawals**          | 6 mock withdrawals, approve/deny/block update local state only            |
| **Transactions**         | 7 mock transactions, no real ledger                                       |
| **Settings**             | `mockSettings` object, RPC test is 2s simulated delay                     |

### Auth

| Item                     | What's Fake                                                               |
| ------------------------ | ------------------------------------------------------------------------- |
| **Credentials**          | Hardcoded: `user@test.com` / `admin@test.com`, password `admin`           |
| **Registration**         | No backend — form doesn't submit                                          |

---

## Broken / Non-Functional

### Critical

- [ ] **Registration page** — no `onSubmit` handler, `action=""`, button says "Login to Portal"
- [ ] **Profile page** — renders only `<div>page</div>`, completely empty
- [ ] **Zustand store** — defined in `stores/useExamStore.ts` but never imported/used anywhere

### Buttons That Do Nothing

- [ ] Dashboard → "Deposit Funds" button — no handler
- [ ] Dashboard → "Withdraw Funds" button — no handler
- [ ] Dashboard → "View Leaderboard" button — no handler
- [ ] Wallet → "Withdraw Funds" button — no handler
- [ ] Wallet → Copy address button — no handler
- [ ] Wallet → Pagination buttons — no handler
- [ ] Leaderboard → "See remaining 1,230 participants" — no handler
- [ ] Landing page → "About Platform" button — no handler

### CSS / Config Issues

- [ ] `globals.css` — `color: var(--background)` sets text to background color (should be `--foreground`)
- [ ] `globals.css` — `background: black` hardcoded, ignores theme variables
- [ ] `globals.css` — `font-family: Arial` overrides Geist font from next/font
- [ ] `package.json` — `eslint-config-next: 16.1.1` mismatched with Next.js 14
- [ ] `package.json` — `--no-lint` in build script hides issues
- [ ] `next.config.js` — `hostname: "**"` allows images from any domain

---

## To Build — Backend (FastAPI)

### Database & Models

- [ ] Database setup (PostgreSQL or MongoDB — TBD)
- [ ] User model (name, email, hashed password, role, wallet balance, nickname)
- [ ] Exam model (title, subject, questions, schedule, prize pool, entry fee, status)
- [ ] Question model (text, options, correct answer, exam reference)
- [ ] Transaction model (user, type, amount, status, timestamp)
- [ ] Leaderboard/Result model (user, exam, score, rank, time taken)

### API Endpoints

- [ ] `POST /api/register` — user registration with password hashing
- [ ] `GET /api/user/profile` — get user profile
- [ ] `PUT /api/user/profile` — update profile
- [ ] `GET /api/exams` — list available exams
- [ ] `GET /api/exams/{id}` — exam details + questions
- [ ] `POST /api/exams/{id}/register` — register for exam (deduct fee)
- [ ] `POST /api/exams/{id}/submit` — submit answers, calculate score
- [ ] `GET /api/exams/{id}/results` — results + leaderboard
- [ ] `GET /api/wallet` — wallet balance
- [ ] `GET /api/wallet/transactions` — transaction history
- [ ] `POST /api/wallet/withdraw` — request withdrawal
- [ ] `GET /api/leaderboard` — global leaderboard
- [ ] Admin CRUD endpoints for exams, deposits, withdrawals, settings

---

## To Build — Frontend Fixes & Redesign

> Modern redesign, same color palette.

### Pages to Fix

- [x] **Registration page** — redesigned with glassmorphism, animated bg, form fields wired up (needs backend)

- [ ] **Profile page** — design and build from scratch
- [ ] **Landing page** — fill in feature section, wire up "About" button

### Pages to Redesign (Modern UI)

- [ ] Landing page
- [x] Login page — glassmorphism, animated bouncing logo bg, random questions, modern form
- [x] Register page — matching glassmorphism design
- [x] User dashboard — Header+Footer layout, wallet/stats cards, quick access, dynamic island tabs
- [ ] Exam Arena (support multiple arenas with entry fees and prize pools)
- [ ] Exam details
- [ ] Exam start
- [ ] Live exam
- [ ] Results page (show real username, real leaderboard)
- [ ] Wallet (wire up deposit/withdraw/copy)
- [ ] Leaderboard (real data, filtering)
- [ ] Profile (build from scratch)
- [ ] Settings (expand beyond just logout)
- [ ] Admin dashboard
- [ ] Admin exams management
- [ ] Admin create/edit exam
- [ ] Admin deposits
- [ ] Admin withdrawals
- [ ] Admin transactions
- [ ] Admin settings

### Frontend Integration

- [ ] Connect all pages to FastAPI endpoints
- [ ] Replace all hardcoded/mock data with API calls
- [ ] Wire up Zustand store to manage fetched data
- [ ] Add loading states and error handling
- [ ] Add form validation across all forms
- [ ] Make dashboard timer dynamic (countdown from real exam data)

---

## Infrastructure / Config

- [ ] Generate strong `NEXTAUTH_SECRET` for production
- [ ] Whitelist specific image domains in `next.config.js`
- [ ] Fix ESLint config version mismatch
- [ ] Remove `--no-lint` from build script
- [ ] Fix `globals.css` color/font issues
- [ ] Add environment variable validation
- [ ] Set up FastAPI project structure
- [ ] Add testing (frontend + backend)

---

## Progress Log

| Date       | What Changed                                                    |
| ---------- | --------------------------------------------------------------- |
| 2026-02-10 | Created `.env.local` (fixed login), renamed README → CONFIG.md  |
| 2026-02-10 | Wrote new README.md with project overview                        |
| 2026-02-10 | Created TRACKER.md (this file)                                   |
| 2026-02-10 | Redesigned Header (dynamic island profile, notifications, logo)  |
| 2026-02-10 | Redesigned Footer (wallet, stats, theme toggle)                  |
| 2026-02-10 | Redesigned Dashboard (wallet card, stats, quick access, tabs)    |
| 2026-02-10 | Built theme system (Zustand + CSS variables, dark/light)         |
| 2026-02-10 | Fixed light theme contrast (surface, borders, text, shadows)     |
| 2026-02-10 | Redesigned Login page (glassmorphism + animated bouncing logos)   |
| 2026-02-10 | Redesigned Register page (matching glassmorphism design)         |
| 2026-02-10 | Introduced Arena concept (exam arena, arena board vs global board)|
| 2026-02-10 | Added CSS filter logo inversion for light theme                  |
