# ASCENT-1004

Dark, terminal-inspired public self-improvement and progress-tracking platform for a multi-year MIT mission arc.

## Stack

- Next.js App Router
- TailwindCSS
- Supabase Auth, Postgres, Storage, and RLS
- Vercel deployment and scheduled cron route

## What It Includes

- Live countdown to the MIT application horizon, defaulting to January 5, 2029
- Pi Day 2029 decision horizon tracker
- Public mission dashboard with streak, study hours, gym consistency, physics progress, and latest post
- Timeline/archive with `DAY ###` identifiers
- Failure Archive for missed days and broken streaks
- Supabase auth with encrypted password handling through Supabase Auth
- Role-based permissions: only `admin` can publish posts and manage official post media
- User profiles with avatar, banner, bio, social links, join date, and comment history
- Comments for authenticated users
- Admin dashboard with analytics, streak metrics, publishing, uploads, and automation status
- Missed-day cron endpoint that can trigger Instagram via webhook or Graph API media publishing

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Without Supabase env vars, the site runs in demo mode using seed mission data.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy the Supabase project URL and anon key into `.env.local`.
4. Copy the service role key into `.env.local` for analytics and cron automation routes.
5. Create the real Micheal user in Supabase Auth.
6. Promote that user manually in SQL:

```sql
update public.profiles
set username = 'Micheal', display_name = 'Micheal', role = 'admin'
where id = '<AUTH_USER_UUID>';
```

Public signup intentionally cannot claim `Micheal`; this prevents username-based admin impersonation.

## Instagram Missed-Day Automation

The cron route is `GET /api/cron/missed-day`.

Vercel cron is configured in `vercel.json` for 16:30 UTC, which is 22:00 Asia/Kolkata. Adjust this if your cutoff changes.

Instagram Graph API does not support text-only public posts. Configure one of these:

- `INSTAGRAM_MISSED_DAY_WEBHOOK_URL` for Zapier/Make/custom automation
- `INSTAGRAM_ACCOUNT_ID`, `INSTAGRAM_GRAPH_TOKEN`, and `INSTAGRAM_FAILURE_IMAGE_URL` for Graph API media publishing

Protect the endpoint with `CRON_SECRET`; send it as `Authorization: Bearer <secret>`.

## Deployment

1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Add all `.env.example` variables in Vercel Project Settings.
4. Deploy.
5. Confirm `/api/cron/missed-day` appears under Vercel Cron Jobs.

## Security Notes

- Passwords are handled by Supabase Auth, not stored manually by the app.
- Row Level Security prevents non-admin users from publishing posts.
- Profile updates cannot change `role`; role changes require service-role SQL/admin operations.
- Public users can comment and customize profiles, but cannot publish mission posts.
