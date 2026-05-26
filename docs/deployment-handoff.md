# ASCENT-1004 Deployment Handoff

This file exists so another developer can finish cloud setup without reverse-engineering the project.

## Current Local State

- Project path: `/Users/sentaxic/Documents/New project/ascent-1004`
- Git repo initialized locally inside this folder.
- Main branch has the completed app committed.
- Build passes locally with `npm run build`.
- TypeScript passes with `npm run typecheck`.

## Cloud Work Still Requires Auth

The local machine must be authenticated to:

- GitHub CLI: `gh auth login`
- Supabase CLI: `supabase login`
- Vercel CLI: `vercel login`

Without these logins or tokens, no agent can legally create repos/projects/deployments on those accounts.

## GitHub

```bash
cd "/Users/sentaxic/Documents/New project/ascent-1004"
gh auth login
gh repo create ascent-1004 --public --source=. --remote=origin --push
```

If the remote already exists:

```bash
git push -u origin main
```

## Supabase

Create a project named `ascent-1004` in the Supabase dashboard or with the CLI.

Then run the SQL in:

```text
supabase/schema.sql
```

Recommended dashboard route:

1. Open Supabase.
2. Create project `ascent-1004`.
3. Go to SQL Editor.
4. Paste and run `supabase/schema.sql`.
5. Go to Project Settings > API.
6. Copy Project URL, anon key, and service-role key.

Create the real admin:

1. Sign up in the app with the intended email.
2. Find the user UUID in Supabase Auth.
3. Run:

```sql
update public.profiles
set username = 'Micheal', display_name = 'Micheal', role = 'admin'
where id = '<AUTH_USER_UUID>';
```

## Vercel

```bash
cd "/Users/sentaxic/Documents/New project/ascent-1004"
vercel login
vercel link
```

Add production env vars from `.env.example`:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_MIT_APPLICATION_DEADLINE production
vercel env add NEXT_PUBLIC_MIT_DECISION_HORIZON production
vercel env add MISSION_TIME_ZONE production
vercel env add MISSED_DAY_CUTOFF_HOUR production
vercel env add CRON_SECRET production
vercel env add NEXT_PUBLIC_REPOSITORY_URL production
```

Optional Instagram automation env vars:

```bash
vercel env add INSTAGRAM_MISSED_DAY_WEBHOOK_URL production
vercel env add INSTAGRAM_ACCOUNT_ID production
vercel env add INSTAGRAM_GRAPH_TOKEN production
vercel env add INSTAGRAM_FAILURE_IMAGE_URL production
```

Deploy:

```bash
vercel --prod
```

## Important Implementation Notes

- Public users can create accounts, edit profiles, upload avatar/banner images, and comment.
- Only admin users can publish posts and manage official post media.
- The username `Micheal` is reserved during public signup to prevent impersonation.
- The real admin must be promoted manually with SQL using the Supabase service role/admin dashboard.
- Missed-day automation route is `/api/cron/missed-day`.
- Vercel cron schedule is in `vercel.json` and currently runs at `16:30 UTC`, which is `22:00 Asia/Kolkata`.
- Instagram Graph API requires media publishing; text-only posts are not supported. Use `INSTAGRAM_FAILURE_IMAGE_URL` or a webhook automation.
