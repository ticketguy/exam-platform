# Nocho — Design A (FastAPI Backend)

A competitive knowledge-testing platform with a **FastAPI Python backend** and **Next.js 14 frontend**. This branch uses FastAPI for authentication, user management, and data — the frontend calls the FastAPI API directly.

---

## Architecture

```
┌──────────────────────┐        ┌──────────────────────┐
│   Next.js Frontend   │  HTTP  │   FastAPI Backend     │
│   (exam-platform/)   │ ──────▶│   (exam-api/)         │
│   Port: 3000         │        │   Port: 8000          │
└──────────────────────┘        └──────────────────────┘
         │                                │
         │ NextAuth JWT                   │ SQLAlchemy
         │                                ▼
         │                      ┌──────────────────────┐
         │                      │     PostgreSQL        │
         └──────────────────────│     Database          │
                                └──────────────────────┘
```

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | Next.js 14 (App Router), TypeScript 5   |
| Styling        | Tailwind CSS 4 + CSS custom properties  |
| Auth           | NextAuth 4 (JWT, calls FastAPI)         |
| State          | Zustand (localStorage persistence)      |
| Backend        | FastAPI (Python 3.10+)                  |
| ORM            | SQLAlchemy + Alembic (migrations)       |
| Database       | PostgreSQL 14+                          |
| Font           | Geist (via next/font)                   |

## Prerequisites

- **Node.js** 18+ (for the frontend)
- **Python** 3.10+ (for the FastAPI backend)
- **PostgreSQL** 14+ (local or hosted — Supabase, Neon, Railway, etc.)
- **pip** (comes with Python)

## Quick Start

### Step 1 — Set up the FastAPI backend (`exam-api/`)

```bash
cd exam-api

# Create a virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run database migrations
alembic upgrade head

# Seed initial data (optional)
python seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be available at [http://localhost:8000](http://localhost:8000).
Check [http://localhost:8000/docs](http://localhost:8000/docs) for auto-generated API docs.

### Step 2 — Set up the Next.js frontend

```bash
# (from the repo root)

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env — set API_URL to where your FastAPI is running

# Start the frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Frontend (`.env` in repo root)

```env
# Random secret for NextAuth JWT signing
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here

# URL of this Next.js frontend (no trailing slash)
NEXTAUTH_URL=http://localhost:3000

# URL of the FastAPI backend
API_URL=http://localhost:8000
```

### Backend (`exam-api/.env`)

```env
# PostgreSQL connection string
# Use ?sslmode=require in production
DATABASE_URL=postgresql://user:password@localhost:5432/nocho

# Random secret for signing JWT tokens
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-random-secret-here

# JWT settings (defaults are fine)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Required Variables Summary

| Service  | Variable                      | Required | Notes                           |
| -------- | ----------------------------- | -------- | --------------------------------|
| Frontend | `NEXTAUTH_SECRET`             | Yes      | Min 32 random characters        |
| Frontend | `NEXTAUTH_URL`                | Yes      | Your production domain          |
| Frontend | `API_URL`                     | Yes      | Where FastAPI is running        |
| Backend  | `DATABASE_URL`                | Yes      | PostgreSQL connection string    |
| Backend  | `SECRET_KEY`                  | Yes      | Random, min 32 characters       |
| Backend  | `ALGORITHM`                   | No       | Default: HS256                  |
| Backend  | `ACCESS_TOKEN_EXPIRE_MINUTES` | No       | Default: 1440 (24 hours)        |

---

## Production Deployment

### FastAPI backend

FastAPI can be hosted on any Python-compatible host:
- **Railway** — connect repo, set env vars, it detects FastAPI automatically
- **Render** — free tier available, set start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Fly.io** — good for Docker-based deployments
- **VPS (Ubuntu)** — run with `gunicorn` + `uvicorn` workers behind nginx

For production, update the CORS origins in `exam-api/app/main.py`:
```python
allow_origins=[
    "https://your-frontend-domain.com",
]
```

### Next.js frontend

Deploy to **Vercel** (recommended):
1. Push this branch to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel domain)
   - `API_URL` (your FastAPI production URL)
4. Deploy — Vercel auto-detects Next.js

---

## Project Structure

```
(repo root)              — Next.js frontend
├── app/
│   ├── (admin)/admin/   — Admin panel (hidden behind /idokosafehouse)
│   ├── (auth)/          — Login, register
│   ├── (user)/          — Dashboard, exams, wallet, profile, settings
│   ├── api/auth/        — NextAuth handler
│   └── page.tsx         — Landing page
├── lib/
│   └── auth.ts          — NextAuth config (calls FastAPI for login)
├── middleware.ts         — Route protection + hidden admin slug
├── .env.example         — Frontend env template
│
exam-api/                — FastAPI backend
├── app/
│   ├── main.py          — FastAPI app + CORS
│   ├── config.py        — Settings (pydantic-settings)
│   ├── database.py      — SQLAlchemy engine + session
│   ├── dependencies.py  — Auth dependencies (get_current_user)
│   ├── models/          — SQLAlchemy models
│   ├── routers/         — API route handlers (auth, user)
│   └── schemas/         — Pydantic request/response schemas
├── alembic/             — Database migrations
├── seed.py              — Seed script (demo users)
├── requirements.txt     — Python dependencies
└── .env.example         — Backend env template
```

## Admin Panel

The admin panel is hidden behind a secret URL slug:
- **Access:** `/idokosafehouse` (rewrites to `/admin` internally)
- **Direct `/admin` access** returns 404
- All admin routes require `role: "admin"` in the JWT

## Scripts

### Frontend

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start dev server (Turbo)       |
| `npm run build` | Production build               |
| `npm start`     | Start production server        |
| `npm run lint`  | Run ESLint                     |

### Backend

| Command                                   | Description                    |
| ----------------------------------------- | ------------------------------ |
| `uvicorn app.main:app --reload`           | Start dev server               |
| `uvicorn app.main:app --host 0.0.0.0`    | Start for production           |
| `alembic upgrade head`                    | Run all pending migrations     |
| `alembic revision --autogenerate -m "msg"`| Create a new migration         |
| `python seed.py`                          | Seed demo data                 |
| `pip install -r requirements.txt`         | Install dependencies           |