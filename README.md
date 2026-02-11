# Nocho — Design A (FastAPI Backend)

> **Branch:** `design-a`
> **Backend:** FastAPI (separate `exam-api` service required)
> **Focus:** Full UI redesign with FastAPI auth integration, animated backgrounds, and dual theme support

---

## What's Special About This Branch

This branch connects to the **FastAPI backend** (`exam-api/`) for real authentication and user management. It features a fully redesigned UI with glassmorphism, canvas-based physics animations, and a Nigerian-market-focused experience.

### Key Features

#### 1. FastAPI Backend Authentication
- Login and registration hit the FastAPI backend at `/api/v1/auth/login` and `/api/v1/auth/register`
- JWT tokens from FastAPI are stored in the NextAuth session
- Profile updates sync to the backend via `PATCH /api/v1/users/me`
- Role-based access control (user vs admin) enforced through middleware

#### 2. Canvas Physics Animation (Animated Auth Background)
- Custom 2D physics engine rendered on HTML5 Canvas
- Bouncing balls with logo textures, collision detection, and split mechanics
- Particle burst effects on ball collisions
- **60+ Nigerian trivia questions** that spawn and float upward when balls collide
- Topics include history, culture, sports, food, and geography
- Runs at 60fps using `requestAnimationFrame`

#### 3. Dual Theme System (Dark/Light)
- Zustand store with `localStorage` persistence
- CSS custom properties switch all colors via `data-theme` attribute on the root
- **Dark (default):** Near-black background (#0a0a0a), glassmorphic surfaces, white text
- **Light:** Light gray background (#f0f1f3), white cards, dark text
- 300ms transition animation on theme switch
- Theme toggle available in Settings and in the Footer bar

#### 4. Glassmorphism Design Language
- `backdrop-blur-xl` on all overlays and dropdowns
- Semi-transparent RGBA backgrounds throughout
- Rounded corners (`rounded-2xl`) on all cards
- No hard shadows — soft/none approach
- Themed card variants: `.darkCard`, `.redCard`, `.gradientCard`

#### 5. Dynamic Island Navigation (Header)
- Center-aligned pill navigation: Arena | Profile | Global Leaderboard
- Red (#8B1E1E) active state indicators
- Notification bell with unread count badge and dropdown list
- User profile dropdown with avatar, name, email, and quick links
- Glassmorphic dropdowns with smooth transitions

#### 6. Live Stats Footer
- Fixed bottom bar showing real-time user stats
- Wallet balance (Naira), global rank, win rate, average score
- Theme toggle button (sun/moon icon)
- Auto-hides during exam routes (`/start`, `/live-exam`)

#### 7. Profile Management
- Editable: display name, nickname (@handle), bio (120 char limit), avatar upload
- 8-card stats layout: earnings, arenas, wins, win rate, avg score, streak, rank, verification
- Sharable profile link: `nocho.ng/@nickname` with copy-to-clipboard
- Profile changes sync to Header in real-time via Zustand store

#### 8. Settings Panel
- **Appearance:** Dark/light theme toggle
- **Notifications:** 4 toggles (exam reminders, results, wallet alerts, promotions)
- **Privacy:** 3 toggles (public profile, show earnings, leaderboard visibility)
- **Security:** Change password form, active sessions display
- **Account:** Logout and delete account with confirmation dialog

#### 9. Gamified Dashboard
- Wallet card with balance show/hide toggle and deposit/withdraw buttons
- 4-stat summary: exams, streak, win rate, avg score
- Tabbed view: My Active (with countdown timers), Upcoming, Arena Board, Recent Activity
- Pill-style tab navigation with red active state

#### 10. Nigerian Market Customization
- Naira currency throughout the platform
- Nigerian trivia questions in the animated background
- "Nocho" / "9ja" / "Naija" branding in floating text
- Subject arenas aligned with JAMB/WAEC/UTME prep

---

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 14 (App Router)                  |
| Language       | TypeScript 5                              |
| Styling        | Tailwind CSS 4 + CSS custom properties   |
| Authentication | NextAuth 4 + FastAPI JWT backend         |
| State          | Zustand (localStorage persistence)       |
| Backend        | FastAPI (separate `exam-api/` service)   |
| Database       | PostgreSQL (via FastAPI)                  |
| Font           | Geist (via next/font)                     |
| Icons          | react-icons                               |

## Prerequisites

- Node.js 18+
- Python 3.10+ (for the FastAPI backend)
- PostgreSQL database
- The `exam-api/` service running

## Getting Started

### 1. Start the Backend

```bash
cd exam-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Start the Frontend

```bash
cd exam-platform
npm install
npm run dev
```

### Environment Variables

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Test Credentials

| Role  | Email          | Password |
| ----- | -------------- | -------- |
| User  | user@test.com  | admin    |
| Admin | admin@test.com | admin    |

## Route Protection

- **Public:** `/`, `/login`, `/register`, `/admin/login`
- **User-only:** `/dashboard`, `/exams`, `/wallet`, `/leaderboard`, `/profile`, `/settings`
- **Admin-only:** `/admin/*`

## Project Structure

```
app/
├── (admin)/              # Admin route group
├── (auth)/               # Auth pages (login, register)
├── (user)/               # User pages (dashboard, exams, wallet, leaderboard, profile, settings)
├── api/auth/             # NextAuth API route
├── page.tsx              # Landing page with arena showcase
└── globals.css           # Theme system CSS variables

components/
├── auth/
│   └── AnimatedAuthBackground.tsx   # Canvas physics + trivia engine
├── layout/
│   ├── Header.tsx                   # Dynamic island navigation
│   └── Footer.tsx                   # Live stats bar with theme toggle
└── ui/

lib/
└── auth.ts               # NextAuth config pointing to FastAPI

stores/
├── useExamStore.ts        # Exam data store
├── useProfileStore.ts     # Profile data with API sync
└── useThemeStore.ts       # Dark/light theme persistence
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server (Turbo) |
| `npm run build` | Production build         |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |