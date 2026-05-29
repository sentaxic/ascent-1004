# ASCENT-1004 — Appwrite Setup

This is the complete, ordered walkthrough to stand up the Appwrite backend
the codebase now expects (Auth + Database + Storage), wire it into local dev
and Vercel, and fix the verification-email-redirects-to-localhost bug that
killed the old Supabase flow.

> **Why this fixes the bug:** verification links are built from
> `NEXT_PUBLIC_SITE_URL` (see `appUrl()` in `src/lib/config.ts`) and Appwrite
> only honors redirect URLs whose hostname is a **registered Web platform**.
> Register the production domain (Step 5) and links always point there — never
> `localhost:3000`.

---

## Prerequisites
- An [Appwrite Cloud](https://cloud.appwrite.io) account (free tier is fine).
- This repo cloned locally with `npm install` already run.

---

## Step 1 — Create the project & get the endpoint + project ID
1. Go to <https://cloud.appwrite.io> → **Create project**. Name it `ascent-1004`.
2. After it's created, open **Project Settings**. Copy:
   - **Project ID** → `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - **API Endpoint** (e.g. `https://cloud.appwrite.io/v1` or your region's
     equivalent like `https://fra.cloud.appwrite.io/v1`) → `NEXT_PUBLIC_APPWRITE_ENDPOINT`

## Step 2 — Create a server API key
1. **Overview → Integrations → API keys → Create API key**.
2. Name it `server`. For scopes, the simplest reliable choice is **select all**
   (it never leaves the server). At minimum you need the **Database**,
   **Storage**, and **Auth** scope groups — the provisioning script needs
   `databases`/`collections`/`attributes`/`indexes`/`documents` and `buckets`;
   sign-up/login needs `users` and `sessions`.
3. Copy the secret → `APPWRITE_API_KEY`. **This is server-only — never prefix it
   with `NEXT_PUBLIC_`.**

## Step 3 — Fill `.env.local`
Copy `.env.example` to `.env.local` and fill the required Appwrite values:

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<from Step 1>
APPWRITE_API_KEY=<from Step 2>
APPWRITE_ADMIN_EMAIL=sentaxic@gmail.com   # the only email allowed to be "Micheal"
NEXT_PUBLIC_SITE_URL=https://ascent-1004.vercel.app
```

The database ID, bucket IDs, and collection IDs all have defaults that match
the provisioning script, so you don't need to set them unless you renamed
something.

## Step 4 — Provision the database, collections & buckets
Run the included script. It is idempotent (safe to re-run):

```bash
npm run setup:appwrite
```

This creates:
- Database `ascent_1004`
- 9 collections with the exact attributes + indexes the app reads/writes:
  `profiles`, `sections`, `posts`, `post_media`, `comments`,
  `failure_events`, `mission_settings`, `visitor_events`, `automation_logs`
- 2 storage buckets: `profiles` (avatars/banners) and `post_media`
- Seed data: the `mission_settings` singleton and 5 default content sections
  (Mission Log, Physics Research, Devlog, Gym Journal, Philosophical Notes)

Run `npm run setup:appwrite -- --no-seed` if you want the schema only.

## Step 5 — Register Web platforms (the auth fix) ⚠️
**Settings → Platforms → Add platform → Web app.** Add two:
1. **Production** — Hostname: `ascent-1004.vercel.app`
2. **Local dev** — Hostname: `localhost`

(Add your Vercel preview domain too if you use preview deploys.) Without this,
Appwrite rejects the verification/recovery redirect URLs and the email flow
breaks — exactly the failure we migrated away from.

## Step 6 — Create the admin account ("Micheal")
The role is assigned automatically from the email, so just sign up normally:
1. Run the app (`npm run dev`) or use the deployed site.
2. Go to `/auth/signup` and register with:
   - **Username:** `Micheal`
   - **Email:** `sentaxic@gmail.com` (must equal `APPWRITE_ADMIN_EMAIL`)
   - **Password:** your choice (8+ chars)
3. `ensureProfile()` (`src/app/actions/auth.ts`) sees the admin email and writes
   `role: "admin"` to the profile document. That's what unlocks `/admin`.

> The signup form blocks anyone else from claiming the `Micheal` username
> unless their email matches `APPWRITE_ADMIN_EMAIL`.

**Optional but recommended — add the `admin` label:** in **Auth → Users →
(your user) → Labels**, add a label `admin`. Privileged writes run through the
server API key (so publishing works without it), but the label makes the
document-level `Role.label("admin")` permissions meaningful and is needed for
any future client-side admin actions.

## Step 7 — Verify the email flow
Sign up, check your inbox, click the verification link. It should land on
`https://ascent-1004.vercel.app/auth/verify` (or `localhost:3000/auth/verify`
in dev if you set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` locally) — never
a dead localhost link from a production email.

## Step 8 — Vercel environment variables
In the Vercel project → **Settings → Environment Variables**, add the same keys
for **Production** (and **Preview**):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | your endpoint |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | your project ID |
| `APPWRITE_API_KEY` | your server key |
| `APPWRITE_ADMIN_EMAIL` | `sentaxic@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://ascent-1004.vercel.app` |
| `CRON_SECRET` | a long random string |
| `MISSION_TIME_ZONE` | `Asia/Kolkata` |
| `MISSED_DAY_CUTOFF_HOUR` | `22` |

Then **redeploy** so the new env is picked up.

## Step 9 — Missed-day cron
`vercel.json` already schedules `GET /api/cron/missed-day` at `30 16 * * *`
(16:30 UTC = 22:00 Asia/Kolkata, matching the cutoff hour). The route checks
`Authorization: Bearer $CRON_SECRET`, so set `CRON_SECRET` in Vercel (Step 8).
Instagram/webhook posting is optional — leave the `INSTAGRAM_*` vars blank to
just record failures in the archive.

---

## Environment variable reference
**Required:** `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`,
`APPWRITE_API_KEY`, `APPWRITE_ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

**Optional (defaults match the seed script):** `APPWRITE_DATABASE_ID`
(`ascent_1004`), `APPWRITE_PROFILE_BUCKET_ID` (`profiles`),
`APPWRITE_POST_MEDIA_BUCKET_ID` (`post_media`), and
`APPWRITE_<NAME>_COLLECTION_ID` overrides.

**Mission / automation:** `MISSION_TIME_ZONE`, `MISSED_DAY_CUTOFF_HOUR`,
`CRON_SECRET`, `NEXT_PUBLIC_MIT_APPLICATION_DEADLINE`,
`NEXT_PUBLIC_MIT_DECISION_HORIZON`, `NEXT_PUBLIC_REPOSITORY_URL`, and the
optional `INSTAGRAM_*` keys.

---

## Troubleshooting
- **Verification link goes to localhost from a production email** → `NEXT_PUBLIC_SITE_URL`
  isn't set in the environment that sent it, or the hostname isn't a registered
  Web platform (Step 5).
- **`/admin` 404s for the admin** → the profile document's `role` isn't `admin`.
  Confirm you signed up with `APPWRITE_ADMIN_EMAIL`, or edit the `profiles`
  document's `role` to `admin` in the console.
- **"Appwrite is not configured" errors** → `NEXT_PUBLIC_APPWRITE_ENDPOINT`,
  `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, or `APPWRITE_API_KEY` is missing.
- **Provisioning script: attribute "stuck"/"failed"** → re-run
  `npm run setup:appwrite`; it skips what exists and retries the rest.
- **Uploads fail for large video** → the `post_media` bucket caps files at 50 MB
  with encryption off (set in the script). Raise `maximumFileSize` there if needed.
