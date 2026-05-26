export const siteConfig = {
  name: "ASCENT-1004",
  tagline: "Public ascent log for physics, discipline, and the MIT arc.",
  adminUsername: "Micheal",
  applicationDeadline:
    process.env.NEXT_PUBLIC_MIT_APPLICATION_DEADLINE ?? "2029-01-05T23:59:59+05:30",
  decisionHorizon:
    process.env.NEXT_PUBLIC_MIT_DECISION_HORIZON ?? "2029-03-14T15:14:00+05:30",
  missionTimeZone: process.env.MISSION_TIME_ZONE ?? "Asia/Kolkata",
  missedDayCutoffHour: Number(process.env.MISSED_DAY_CUTOFF_HOUR ?? 22),
  repositoryUrl: process.env.NEXT_PUBLIC_REPOSITORY_URL ?? "https://github.com/your-username/ascent-1004",
};

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function formatMissionDate(date: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function missionDateKey(date = new Date(), timeZone = siteConfig.missionTimeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
