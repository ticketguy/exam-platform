# Nocho — Frontend Demo (Self-Contained)

> **Branch:** `frontend-demo` (base branch for all new frontend designs)
> **Backend:** Built-in Next.js API routes (no external backend needed)
> **Focus:** Fully standalone demo with in-memory auth, hidden admin panel, and waitlist toggle

---

## What's Special About This Branch

This branch runs as a **completely self-contained Next.js app** — no FastAPI, no PostgreSQL, no external services. Everything is embedded: authentication, user management, and settings all live inside Next.js API routes with in-memory storage.

This is the **base branch** for creating new frontend design variations.

### Key Features

#### 1. Self-Contained Next.js Backend

No external API needed. All backend logic runs as Next.js Route Handlers:

- `POST /api/v1/auth/login` — authenticates against in-memory user store
- `POST /api/v1/auth/register` — creates users with email/nickname uniqueness checks
- `GET /api/v1/users/me` — returns authenticated user profile
- `PATCH /api/v1/users/me` — updates profile fields (nickname, email, phone, country, state)
- `GET /api/v1/settings` — fetches platform settings (waitlist state)
- `PATCH /api/v1/settings` — updates platform settings

All responses match the FastAPI format so switching to a real backend later is seamless.

#### 2. In-Memory User Store (`lib/users.ts`)

- Users stored in a JavaScript `Map` — no database required
- Passwords hashed with bcrypt
- Pre-seeded demo accounts ready on startup:

| Role  | Email           | Password |
| ----- | --------------- | -------- |
| Admin | admin@nocho.ng  | admin123 |
| User  | demo@nocho.ng   | demo123  |

- Data resets on server restart (by design for demos)

#### 3. Hidden Admin Panel (Secret Slug)

The admin panel is **not** at `/admin`. It's hidden behind a secret URL:

- **Access:** `/idokosafehouse` (rewrites internally to `/admin`)
- **Direct `/admin` access** returns a 404 page
- Admin login at `/idokosafehouse/login`
- All admin routes require `role: "admin"` in the session
- Regular users trying `/idokosafehouse/*` get redirected to their dashboard

#### 4. Waitlist Toggle (Admin-Controlled)

Admins can toggle the platform between **waitlist mode** and **open registration**:

- **Waitlist ON (default):** Landing page shows email capture form, login/register buttons hidden
- **Waitlist OFF:** Landing page shows login/register buttons, normal user flow
- Toggle lives in Admin Settings > Platform tab
- State stored in-memory, controlled via `/api/v1/settings` endpoint
- Landing page fetches the setting on load and adapts in real-time

#### 5. Admin Settings Dashboard (5 Tabs)

Full admin settings panel at `/idokosafehouse/settings`:

- **Platform:** Waitlist toggle (functional)
- **DigiByte:** Mock blockchain RPC config with test connection button
- **Security:** Rate limiting, session timeout, max login attempts (UI mockups)
- **Exam Settings:** Default duration, pass mark, retakes, show answers (UI mockups)
- **Admin Management:** Table of admins, add/remove admins, role assignment

#### 6. Mock JWT Authentication

- Tokens use a simple format: `mock-jwt-{user-id}`
- No cryptographic key management needed
- NextAuth Credentials Provider validates against the in-memory store
- `userType` parameter separates admin vs user login flows
- JWT session strategy (no database sessions)

#### 7. Enhanced Middleware

Route protection with URL rewriting:

- `/idokosafehouse/*` rewrites to `/admin/*` (hidden admin access)
- `/admin/*` direct access returns 404 (blocks discovery)
- Public routes: `/`, `/login`, `/register`, `/idokosafehouse/login`
- User routes require authentication
- Admin routes require `role: "admin"`

#### 8. All Design-A UI Features Included

This branch inherits everything from `design-a`:

- Canvas physics animation with Nigerian trivia
- Dual theme system (dark/light)
- Glassmorphism design language
- Dynamic island navigation header
- Live stats footer
- Profile management with Zustand sync
- Settings panel (appearance, notifications, privacy, security)
- Gamified dashboard with tabs and countdown timers

---

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | Next.js 14 (App Router)                |
| Language       | TypeScript 5                            |
| Styling        | Tailwind CSS 4 + CSS custom properties |
| Authentication | NextAuth 4 (JWT, in-memory store)      |
| State          | Zustand (localStorage persistence)     |
| Backend        | Next.js Route Handlers (embedded)      |
| Database       | None (in-memory JavaScript Map)        |
| Font           | Geist (via next/font)                   |
| Icons          | react-icons                             |

## Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- That's it. No Python, no PostgreSQL, no external services.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Demo Accounts

| Role  | Email           | Password | Login URL                |
| ----- | --------------- | -------- | ------------------------ |
| Admin | admin@nocho.ng  | admin123 | `/idokosafehouse/login`  |
| User  | demo@nocho.ng   | demo123  | `/login`                 |

## Project Structure

```text
app/
├── (admin)/admin/            # Admin pages (hidden behind /idokosafehouse)
│   ├── (dashboard)/settings/ # Admin settings with waitlist toggle
│   └── login/                # Admin login page
├── (auth)/                   # User auth pages (login, register)
├── (user)/                   # User pages (dashboard, exams, wallet, etc.)
├── api/
│   ├── auth/                 # NextAuth API route
│   └── v1/                   # Self-contained API routes
│       ├── auth/login/       # Login endpoint
│       ├── auth/register/    # Register endpoint
│       ├── users/me/         # Profile endpoint
│       └── settings/         # Platform settings endpoint
├── page.tsx                  # Landing page (waitlist-aware)
└── globals.css               # Theme system CSS variables

components/
├── auth/                     # AnimatedAuthBackground (canvas physics)
├── layout/
│   ├── AdminShell.tsx        # Admin layout (uses /idokosafehouse links)
│   ├── Header.tsx            # Dynamic island navigation
│   └── Footer.tsx            # Live stats bar
└── ui/

lib/
├── auth.ts                   # NextAuth config (in-memory provider)
└── users.ts                  # In-memory user store + waitlist state

stores/
├── useExamStore.ts           # Exam data store
├── useProfileStore.ts        # Profile data with sync
└── useThemeStore.ts          # Dark/light theme persistence

middleware.ts                 # Route protection + admin slug rewriting
```

## Branching Strategy

This branch is the **base for new frontend designs**:

- `design-a` — FastAPI backend version (separate, not based on this branch)
- `frontend-demo` — **this branch** (self-contained, base for new designs)
- New design branches should be created from `frontend-demo`

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `npm run dev` | Start dev server (Turbo) |
| `npm run build` | Production build       |
| `npm start`   | Start production server  |
| `npm run lint` | Run ESLint              |