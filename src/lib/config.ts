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
  repositoryUrl: process.env.NEXT_PUBLIC_REPOSITORY_URL ?? "https://github.com/sentaxic/ascent-1004",
  productionUrl: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "https://ascent-1004.vercel.app",
};

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  apiKey: process.env.APPWRITE_API_KEY ?? "",
  databaseId: process.env.APPWRITE_DATABASE_ID ?? "ascent_1004",
  profileBucketId: process.env.APPWRITE_PROFILE_BUCKET_ID ?? "profiles",
  postMediaBucketId: process.env.APPWRITE_POST_MEDIA_BUCKET_ID ?? "post_media",
  collections: {
    profiles: process.env.APPWRITE_PROFILES_COLLECTION_ID ?? "profiles",
    sections: process.env.APPWRITE_SECTIONS_COLLECTION_ID ?? "sections",
    posts: process.env.APPWRITE_POSTS_COLLECTION_ID ?? "posts",
    postMedia: process.env.APPWRITE_POST_MEDIA_COLLECTION_ID ?? "post_media",
    comments: process.env.APPWRITE_COMMENTS_COLLECTION_ID ?? "comments",
    failureEvents: process.env.APPWRITE_FAILURES_COLLECTION_ID ?? "failure_events",
    missionSettings: process.env.APPWRITE_SETTINGS_COLLECTION_ID ?? "mission_settings",
    visitorEvents: process.env.APPWRITE_VISITOR_EVENTS_COLLECTION_ID ?? "visitor_events",
    automationLogs: process.env.APPWRITE_AUTOMATION_LOGS_COLLECTION_ID ?? "automation_logs",
  },
};

export function hasAppwriteEnv() {
  return Boolean(appwriteConfig.endpoint && appwriteConfig.projectId && appwriteConfig.databaseId);
}

export function hasAppwriteAdminEnv() {
  return Boolean(hasAppwriteEnv() && appwriteConfig.apiKey);
}

export function appwriteSessionCookieName() {
  return `a_session_${appwriteConfig.projectId || "ascent_1004"}`;
}

export function appUrl(path = "") {
  const base = siteConfig.productionUrl.startsWith("http") ? siteConfig.productionUrl : `https://${siteConfig.productionUrl}`;
  return new URL(path, base).toString();
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
