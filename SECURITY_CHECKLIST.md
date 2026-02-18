# Nocho — Production Security Checklist

Go through this checklist before deploying to production. Items marked **[CRITICAL]** must be done before going live. Each item explains **what** to do and **how** to do it.

---

## 1. Secrets & API Keys

These are the services Nocho connects to. You need to set them up and put the keys in your `.env` file.

### Database (PostgreSQL) — REQUIRED

You need a PostgreSQL database. Options:
- **Supabase** (free tier): Go to [supabase.com](https://supabase.com), create a project, copy the connection string from Settings > Database
- **Neon** (free tier): Go to [neon.tech](https://neon.tech), create a database, copy the connection string
- **Railway**: Go to [railway.app](https://railway.app), add a PostgreSQL service, copy the connection URL
- **Self-hosted**: Install PostgreSQL on your server

Put the connection string in `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/nocho?schema=public&sslmode=require"
```

- [ ] **[CRITICAL]** `DATABASE_URL` is set with a real PostgreSQL connection string
- [ ] **[CRITICAL]** Connection uses SSL in production (add `?sslmode=require` to the URL)
- [ ] Database user does NOT have `SUPERUSER` privileges (use a limited user)
- [ ] Database is not publicly accessible (use firewall or VPC)
- [ ] Database password is strong and unique (not reused from other services)
- [ ] Database has automatic backups enabled (most providers do this by default)

### NextAuth Secret — REQUIRED

This is used to sign JWT tokens. Generate a random one:

```bash
# Run this in your terminal and copy the output
openssl rand -base64 32
```

Put it in `.env`:
```
NEXTAUTH_SECRET="your-generated-random-string-here"
NEXTAUTH_URL="https://your-domain.com"
```

- [ ] **[CRITICAL]** `NEXTAUTH_SECRET` is a random string (not the default placeholder)
- [ ] **[CRITICAL]** `NEXTAUTH_URL` matches your actual production domain (with `https://`)

### Email (Resend) — OPTIONAL but recommended

Resend sends email verification emails to new users. Without it, verification URLs are logged to the server console instead.

To set up:
1. Go to [resend.com](https://resend.com) and create a free account
2. Go to API Keys, create a new key
3. Go to Domains, add your domain (e.g., `nocho.ng`) and configure DNS records they give you (SPF, DKIM, DMARC)
4. Put the API key in `.env`:

```
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"
```

- [ ] `RESEND_API_KEY` is set (or intentionally left empty for dev mode)
- [ ] If using Resend: domain DNS has SPF, DKIM, and DMARC records configured
- [ ] Sender email (`noreply@nocho.ng` in `lib/email.ts`) matches your verified domain

### DigiByte RPC — OPTIONAL

Only needed if you want real blockchain deposits/withdrawals. If `DGB_MODE=mock`, everything works with fake addresses and transactions.

To set up for real blockchain:
1. Install and run a DigiByte Core node
2. Configure `digibyte.conf` with RPC credentials
3. Set values in `.env`:

```
DGB_RPC_HOST="127.0.0.1"
DGB_RPC_PORT="14022"
DGB_RPC_USER="digibyte"
DGB_RPC_PASS="your-strong-rpc-password"
DGB_MODE="live"
DGB_CONFIRMATIONS_REQUIRED="6"
```

- [ ] **[CRITICAL if live]** DGB RPC is bound to `127.0.0.1` only (not exposed to internet)
- [ ] **[CRITICAL if live]** RPC password is strong and unique
- [ ] `DGB_MODE=mock` is NOT used in production with real user funds
- [ ] Deposit confirmation threshold is >= 6

---

## 2. What's Already Built In (verify these work)

These security features are already coded into Nocho. Just verify they're working:

### Authentication
- [ ] Admin login is only accessible via `/idokosafehouse/login` (hidden URL)
- [ ] Going directly to `/admin` in browser returns a 404 page
- [ ] Regular users cannot access admin pages (they get redirected to `/dashboard`)
- [ ] Passwords are hashed with bcryptjs (never stored in plain text)
- [ ] Failed login does not reveal whether the email exists or not

### Rate Limiting (built into `lib/rate-limit.ts`)
- [ ] Login: max 5 attempts per IP per hour
- [ ] Registration: max 3 per IP per hour
- [ ] Email resend: max 1 per user per 5 minutes
- [ ] Withdrawal: max 3 per user per hour

### Security Headers (configured in `next.config.js`)
- [ ] `X-Frame-Options: DENY` — prevents your site from being loaded in an iframe
- [ ] `X-Content-Type-Options: nosniff` — prevents MIME type attacks
- [ ] `Strict-Transport-Security` — forces HTTPS
- [ ] `Permissions-Policy` — blocks camera/microphone/geolocation access

### Input Validation
- [ ] All user input is validated with Zod schemas before processing
- [ ] Prisma ORM handles SQL parameterization (no SQL injection possible)

---

## 3. Deployment Security

- [ ] **[CRITICAL]** HTTPS is enabled (use Cloudflare, Let's Encrypt, or your host's SSL)
- [ ] `NODE_ENV=production` is set on the server
- [ ] `.env` file is NOT committed to git
- [ ] Server is behind a reverse proxy (nginx, Caddy, or Cloudflare)
- [ ] Process manager restarts the app on crash (use pm2: `pm2 start npm -- start`)

### Recommended: Add Cloudflare (free)

1. Add your domain to [cloudflare.com](https://cloudflare.com)
2. Point your DNS nameservers to Cloudflare
3. Enable "Full (strict)" SSL mode
4. Turn on "Under Attack Mode" if you get DDoS'd
5. This gives you free SSL, DDoS protection, and CDN caching

---

## 4. Admin Panel Security

- [ ] Only trusted people know the admin URL (`/idokosafehouse`)
- [ ] Admin accounts are created via the seed script, not through public registration
- [ ] Change the default admin password (`admin123`) immediately after first login
- [ ] Consider changing the admin slug from `idokosafehouse` to something else in `middleware.ts`

---

## 5. Pre-Go-Live Final Test

Do this final check before announcing your site:

- [ ] Run `bash deploy.sh` — it should complete without errors
- [ ] Open your site in a browser — landing page loads
- [ ] Register a new user account — verify email flow works (or check server logs)
- [ ] Log in as the new user — dashboard loads with real data
- [ ] Log in as admin at `/idokosafehouse/login` — admin panel loads
- [ ] Try opening `/admin` directly — should show 404
- [ ] Check that wallet page shows a DGB deposit address
- [ ] If `DGB_MODE=live`: test a small deposit and withdrawal
- [ ] Review server logs for any errors