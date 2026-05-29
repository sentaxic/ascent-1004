# ASCENT-1004

Dark, terminal-inspired public progress-tracking platform documenting a
multi-year MIT mission arc — physics, discipline, fitness, and daily logs.

## Stack

- Next.js (App Router) + TypeScript
- TailwindCSS
- **Appwrite** — Auth, Database, Storage (server SDK: `node-appwrite`)
- Framer Motion + GSAP for motion
- Vercel deployment + scheduled cron route

## What it includes

- Live countdown to the MIT application horizon (defaults to Jan 5, 2029) and a Pi Day 2029 decision tracker
- Public mission dashboard: streak, study hours, gym consistency, physics progress, latest log
- Timeline/archive with `DAY ###` identifiers and a Failure Archive for missed days
- Appwrite Auth with email verification, recovery, rate limiting, and **production-safe redirects**
- Role-based access: only the `admin` (`Micheal`) can publish posts and manage official media
- Multi-section CMS (Mission Log, Physics Research, Devlog, Gym Journal, Philosophical Notes …)
- User profiles (avatar, banner, bio, social links) and authenticated comments
- Missed-day cron that records failures and can post to Instagram via webhook or Graph API

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill the Appwrite values
npm run dev
```

Open `http://localhost:3000`. Without Appwrite env vars the site runs in demo
mode using seed mission data (no auth, no persistence).

## Backend setup (Appwrite)

Full step-by-step — including the fix for verification emails redirecting to
localhost — is in **[docs/APPWRITE_SETUP.md](docs/APPWRITE_SETUP.md)**. Short version:

1. Create an Appwrite project; copy the endpoint + project ID into `.env.local`.
2. Create a server API key (Database + Storage + Auth scopes); set `APPWRITE_API_KEY`.
3. Provision the database, collections, buckets, and seed data:
   ```bash
   npm run setup:appwrite          # add -- --no-seed for schema only
   ```
4. Register your domains as **Web platforms** in Appwrite (`ascent-1004.vercel.app`
   and `localhost`) so auth redirects resolve correctly.
5. Sign up at `/auth/signup` as `Micheal` with the email in `APPWRITE_ADMIN_EMAIL`
   — that account is auto-assigned the `admin` role.

## Missed-day automation

The cron route is `GET /api/cron/missed-day`, scheduled in `vercel.json` for
16:30 UTC (= 22:00 Asia/Kolkata). Protect it with `CRON_SECRET`
(`Authorization: Bearer <secret>`). Instagram posting is optional:

- `INSTAGRAM_MISSED_DAY_WEBHOOK_URL` for Zapier/Make/custom automation, or
- `INSTAGRAM_ACCOUNT_ID` + `INSTAGRAM_GRAPH_TOKEN` + `INSTAGRAM_FAILURE_IMAGE_URL` for Graph API.

Leave them blank to simply record failures in the archive.

## Deployment

1. Push to GitHub and import the repo in Vercel.
2. Add all `.env.example` variables in Vercel → Settings → Environment Variables
   (Production + Preview), then redeploy.
3. Confirm `/api/cron/missed-day` appears under Vercel Cron Jobs.

## Security notes

- Passwords are handled by Appwrite Auth; the app never stores them.
- Publishing/editing/deleting posts is restricted to the `admin` role; the
  signup form blocks anyone else from claiming the `Micheal` username.
- Privileged writes run server-side through the Appwrite API key (never exposed
  to the client). The `APPWRITE_API_KEY` is server-only — never `NEXT_PUBLIC_`.
- Visitor telemetry is admin-read-only.
