#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="ascent-1004"
SUPABASE_REGION="ap-south-1"

if ! command -v gh >/dev/null 2>&1; then
  echo "Missing GitHub CLI: install with 'brew install gh'" >&2
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Missing Supabase CLI: install with 'brew install supabase/tap/supabase'" >&2
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Missing Vercel CLI: install with 'npm install -g vercel'" >&2
  exit 1
fi

gh auth status
supabase projects list >/dev/null
vercel whoami >/dev/null

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$PROJECT_NAME" --public --source=. --remote=origin --push
else
  git push -u origin main
fi

cat <<'NEXT'

GitHub push complete.

Next Supabase step is interactive because it requires an organization/project choice and database password.
Recommended:
  1. Create a Supabase project named ascent-1004 in the dashboard, or run:
     supabase projects create ascent-1004 --region ap-south-1
  2. Copy URL, anon key, and service role key into .env.local and Vercel.
  3. Run supabase/schema.sql in the SQL editor.
  4. Sign up as Micheal through the app or Supabase Auth.
  5. Promote the created user:
     update public.profiles set username = 'Micheal', display_name = 'Micheal', role = 'admin' where id = '<AUTH_USER_UUID>';

Vercel:
  vercel link
  vercel env add NEXT_PUBLIC_SUPABASE_URL production
  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
  vercel env add SUPABASE_SERVICE_ROLE_KEY production
  vercel env add CRON_SECRET production
  vercel --prod
NEXT
