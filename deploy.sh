#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Nocho — One-Command Production Deployment Script
# ─────────────────────────────────────────────────────────────
# Usage:
#   bash deploy.sh              # Deploy on default port 3000
#   PORT=8080 bash deploy.sh    # Deploy on custom port
#
# This script will:
#   1. Check all prerequisites (Node, npm, PostgreSQL connection)
#   2. Install dependencies
#   3. Generate Prisma client
#   4. Run database migrations
#   5. Seed the database (first run only)
#   6. Build the Next.js app
#   7. Start the production server
#
# Before running, make sure you have a .env file with valid values.
# See .env.example for the template.
# ─────────────────────────────────────────────────────────────

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PORT="${PORT:-3000}"

echo ""
echo -e "${BLUE}══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Nocho — Production Deployment                 ${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════${NC}"
echo ""

# ─── Step 0: Check prerequisites ────────────────────────────

echo -e "${YELLOW}[0/7] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed.${NC}"
    echo "  Install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}ERROR: Node.js 18+ required. Found: $(node -v)${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm is not installed.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} npm $(npm -v)"

# Check .env file
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}  No .env file found. Creating from .env.example...${NC}"
        cp .env.example .env
        echo -e "${RED}  IMPORTANT: Edit .env with your actual values before continuing.${NC}"
        echo -e "${RED}  At minimum, set DATABASE_URL and NEXTAUTH_SECRET.${NC}"
        echo ""
        echo -e "  Run this script again after editing .env"
        exit 1
    else
        echo -e "${RED}ERROR: No .env or .env.example file found.${NC}"
        exit 1
    fi
fi
echo -e "  ${GREEN}✓${NC} .env file exists"

# Source .env to check values
set -a
source .env 2>/dev/null || true
set +a

# Check required env vars
MISSING=0
if [ -z "$DATABASE_URL" ]; then
    echo -e "  ${RED}✗ DATABASE_URL is not set in .env${NC}"
    MISSING=1
fi
if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "generate-a-secure-random-string-here" ]; then
    echo -e "  ${RED}✗ NEXTAUTH_SECRET is not set or still has placeholder value${NC}"
    echo "    Generate one with: openssl rand -base64 32"
    MISSING=1
fi
if [ -z "$NEXTAUTH_URL" ]; then
    echo -e "  ${RED}✗ NEXTAUTH_URL is not set in .env${NC}"
    MISSING=1
fi

if [ "$MISSING" -eq 1 ]; then
    echo ""
    echo -e "${RED}Fix the above .env issues and run deploy.sh again.${NC}"
    exit 1
fi

echo -e "  ${GREEN}✓${NC} DATABASE_URL is set"
echo -e "  ${GREEN}✓${NC} NEXTAUTH_SECRET is set"
echo -e "  ${GREEN}✓${NC} NEXTAUTH_URL = $NEXTAUTH_URL"

if [ -n "$RESEND_API_KEY" ] && [ "$RESEND_API_KEY" != '""' ] && [ "$RESEND_API_KEY" != "" ]; then
    echo -e "  ${GREEN}✓${NC} RESEND_API_KEY is set (email sending enabled)"
else
    echo -e "  ${YELLOW}!${NC} RESEND_API_KEY is empty (email verification will log to console)"
fi

if [ "$DGB_MODE" = "live" ]; then
    echo -e "  ${GREEN}✓${NC} DGB_MODE = live (real blockchain)"
else
    echo -e "  ${YELLOW}!${NC} DGB_MODE = mock (no real blockchain transactions)"
fi

echo ""

# ─── Step 1: Install dependencies ───────────────────────────

echo -e "${YELLOW}[1/7] Installing dependencies...${NC}"
npm ci --omit=dev 2>/dev/null || npm install --omit=dev
# Also need dev deps for prisma generate and build
npm install
echo -e "  ${GREEN}✓${NC} Dependencies installed"
echo ""

# ─── Step 2: Generate Prisma client ─────────────────────────

echo -e "${YELLOW}[2/7] Generating Prisma client...${NC}"
npx prisma generate
echo -e "  ${GREEN}✓${NC} Prisma client generated"
echo ""

# ─── Step 3: Run database migrations ────────────────────────

echo -e "${YELLOW}[3/7] Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "  ${GREEN}✓${NC} Migrations applied"
echo ""

# ─── Step 4: Seed database (skip if admin already exists) ───

echo -e "${YELLOW}[4/7] Checking if database needs seeding...${NC}"

# Try to check if admin exists; if query fails or returns empty, seed
NEEDS_SEED=1
ADMIN_CHECK=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as cnt FROM \"User\" WHERE role = 'admin';" 2>/dev/null || echo "ERROR")

if echo "$ADMIN_CHECK" | grep -q "ERROR"; then
    echo -e "  ${YELLOW}!${NC} Could not check for existing admin, will attempt seed..."
    NEEDS_SEED=1
elif echo "$ADMIN_CHECK" | grep -q "0"; then
    NEEDS_SEED=1
else
    NEEDS_SEED=0
fi

if [ "$NEEDS_SEED" -eq 1 ]; then
    echo -e "  Seeding database with initial data..."
    npx prisma db seed || {
        echo -e "  ${YELLOW}!${NC} Seed had issues (may already be seeded). Continuing..."
    }
    echo -e "  ${GREEN}✓${NC} Database seeded"
else
    echo -e "  ${GREEN}✓${NC} Database already has admin user, skipping seed"
fi
echo ""

# ─── Step 5: Build Next.js ──────────────────────────────────

echo -e "${YELLOW}[5/7] Building Next.js production bundle...${NC}"
NODE_ENV=production npm run build
echo -e "  ${GREEN}✓${NC} Build completed"
echo ""

# ─── Step 6: Summary ────────────────────────────────────────

echo -e "${YELLOW}[6/7] Deployment summary${NC}"
echo -e "  App URL:      ${GREEN}${NEXTAUTH_URL}${NC}"
echo -e "  Port:         ${GREEN}${PORT}${NC}"
echo -e "  Admin panel:  ${GREEN}${NEXTAUTH_URL}/idokosafehouse${NC}"
echo -e "  Admin login:  ${GREEN}${NEXTAUTH_URL}/idokosafehouse/login${NC}"
echo -e "  Email:        $([ -n "$RESEND_API_KEY" ] && echo -e "${GREEN}enabled${NC}" || echo -e "${YELLOW}disabled (dev mode)${NC}")"
echo -e "  DGB mode:     $([ "$DGB_MODE" = "live" ] && echo -e "${GREEN}live${NC}" || echo -e "${YELLOW}mock${NC}")"
echo ""

# ─── Step 7: Start production server ────────────────────────

echo -e "${YELLOW}[7/7] Starting production server on port ${PORT}...${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════${NC}"
echo ""

PORT=$PORT npm start