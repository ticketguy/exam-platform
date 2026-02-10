# Nocho — Competitive Exam Platform

A web-based competitive examination platform where users register for paid academic exams and compete for prizes. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Overview

Nocho provides two portals:

- **User Portal** — Browse and register for exams, take live timed exams, view results, manage a crypto wallet (Naira/Digibyte), and compete on leaderboards.
- **Admin Portal** — Manage exams (create, edit, delete), oversee deposits/withdrawals, view transactions, and monitor platform metrics.

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 14 (App Router)            |
| Language       | TypeScript 5                        |
| Styling        | Tailwind CSS 4                      |
| Authentication | NextAuth 4 (JWT, Credentials)      |
| State          | Zustand (localStorage persistence) |
| Font           | Geist (via next/font)               |
| Icons          | react-icons                         |

## Project Structure

```
app/
├── (admin)/          # Admin route group (dashboard, exams, deposits, withdrawals, transactions, settings)
├── (auth)/           # Auth route group (login, register)
├── (user)/           # User route group (dashboard, exams, wallet, leaderboard, profile, settings)
├── api/auth/         # NextAuth API route
├── layout.tsx        # Root layout with Providers
├── providers.tsx     # SessionProvider wrapper
└── page.tsx          # Landing page

components/
├── layout/           # Sidenav (user), AdminShell (admin)
└── ui/               # Reusable UI components (OverViewCard)

lib/
└── auth.ts           # NextAuth configuration & credentials provider

stores/
└── useExamStore.ts   # Zustand store for exam data

middleware.ts         # Route protection & role-based access control
types/
└── next-auth.d.ts    # NextAuth type augmentations
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Credentials

| Role  | Email            | Password |
| ----- | ---------------- | -------- |
| User  | user@test.com    | admin    |
| Admin | admin@test.com   | admin    |

## Route Protection

The middleware enforces role-based access:

- **Public**: `/`, `/login`, `/register`, `/admin/login`
- **User-only**: `/dashboard`, `/exams`, `/wallet`, `/leaderboard`, `/profile`, `/settings`
- **Admin-only**: `/admin/*`

Unauthorized access redirects to the appropriate login page.

## Current Status

This is a **frontend prototype**. The UI and routing are functional, but:

- All data (exams, transactions, stats) is **mocked/hardcoded**
- Authentication uses **hardcoded test accounts** (no real user registration)
- No database is connected
- Wallet/crypto integration is referenced but **not implemented**
- Several admin pages are **placeholders**

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server (Turbo) |
| `npm run build` | Production build         |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |
