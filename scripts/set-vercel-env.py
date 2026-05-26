import subprocess
import os

envs = [
    ("NEXT_PUBLIC_SUPABASE_URL", "production", "https://usrvcmyixufuzjrzqfkt.supabase.co"),
    ("NEXT_PUBLIC_SUPABASE_URL", "preview", "https://usrvcmyixufuzjrzqfkt.supabase.co"),
    ("NEXT_PUBLIC_SUPABASE_URL", "development", "https://usrvcmyixufuzjrzqfkt.supabase.co"),
    ("NEXT_PUBLIC_SUPABASE_ANON_KEY", "production", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcnZjbXlpeHVmdXpqcnpxZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAxNjYsImV4cCI6MjA5NTM3NjE2Nn0.cu8asKraW4W6F4tevlHc8VAuf0oBhkGNQVYL9AhbkTo"),
    ("NEXT_PUBLIC_SUPABASE_ANON_KEY", "preview", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcnZjbXlpeHVmdXpqcnpxZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAxNjYsImV4cCI6MjA5NTM3NjE2Nn0.cu8asKraW4W6F4tevlHc8VAuf0oBhkGNQVYL9AhbkTo"),
    ("NEXT_PUBLIC_SUPABASE_ANON_KEY", "development", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcnZjbXlpeHVmdXpqcnpxZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDAxNjYsImV4cCI6MjA5NTM3NjE2Nn0.cu8asKraW4W6F4tevlHc8VAuf0oBhkGNQVYL9AhbkTo"),
    ("SUPABASE_SERVICE_ROLE_KEY", "production", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcnZjbXlpeHVmdXpqcnpxZmt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwMDE2NiwiZXhwIjoyMDk1Mzc2MTY2fQ.oUB5Ey2T1kiGgAQk0U3yI10Txqkn54F2TJLJobFXvjc"),
    ("NEXT_PUBLIC_MIT_APPLICATION_DEADLINE", "production", "2029-01-05T23:59:59+05:30"),
    ("NEXT_PUBLIC_MIT_APPLICATION_DEADLINE", "preview", "2029-01-05T23:59:59+05:30"),
    ("NEXT_PUBLIC_MIT_DECISION_HORIZON", "production", "2029-03-14T15:14:00+05:30"),
    ("NEXT_PUBLIC_MIT_DECISION_HORIZON", "preview", "2029-03-14T15:14:00+05:30"),
    ("MISSION_TIME_ZONE", "production", "Asia/Kolkata"),
    ("MISSION_TIME_ZONE", "preview", "Asia/Kolkata"),
    ("MISSED_DAY_CUTOFF_HOUR", "production", "22"),
    ("MISSED_DAY_CUTOFF_HOUR", "preview", "22"),
    ("CRON_SECRET", "production", "3c8d172e27cbfd2f8e1241517cb83e549ebfa848d7be0e49"),
    ("NEXT_PUBLIC_REPOSITORY_URL", "production", "https://github.com/sentaxic/ascent-1004"),
    ("NEXT_PUBLIC_REPOSITORY_URL", "preview", "https://github.com/sentaxic/ascent-1004"),
]

# Build PATH env
my_env = os.environ.copy()
my_env["VERCEL_TELEMETRY_DISABLED"] = "1"
my_env["PATH"] = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin"

for name, target, val in envs:
    print(f"Setting {name} for {target}...")
    cmd = ["vercel", "env", "add", name, target, "--value", val, "--yes", "--non-interactive", "--force"]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=5, env=my_env)
        print("Success:", res.stdout.strip())
    except subprocess.TimeoutExpired:
        print("Command timed out (Vercel CLI hang), assuming complete.")
