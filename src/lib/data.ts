import { notFound } from "next/navigation";
import { Query, type Models } from "node-appwrite";

import { appwriteConfig } from "@/lib/config";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { dashboardSnapshot, defaultMissionSettings, defaultSections, failures as seedFailures, findDemoProfile, posts as seedPosts } from "@/lib/seed-data";
import type { Comment, ContentSection, DashboardSnapshot, FailureEvent, MissionSettings, Post, PostMedia, Profile, SocialLink } from "@/lib/types";

const c = appwriteConfig.collections;

type AnyDoc = Models.Document & Record<string, unknown>;

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapProfile(profile: AnyDoc, commentCount?: number): Profile {
  return {
    id: profile.$id,
    username: stringValue(profile.username, "deleted"),
    displayName: stringValue(profile.displayName, stringValue(profile.username, "Deleted User")),
    role: ["admin", "moderator", "user"].includes(String(profile.role)) ? (profile.role as Profile["role"]) : "user",
    avatarUrl: stringValue(profile.avatarUrl) || null,
    bannerUrl: stringValue(profile.bannerUrl) || null,
    bio: stringValue(profile.bio) || null,
    joinDate: profile.$createdAt,
    socialLinks: parseJson<SocialLink[]>(profile.socialLinksJson, []),
    commentCount,
    activityScore: numberValue(profile.activityScore, 0),
    streak: numberValue(profile.streak, 0),
    badges: stringArray(profile.badges),
    status: ["online", "offline", "unknown"].includes(String(profile.status)) ? (profile.status as Profile["status"]) : "unknown",
  };
}

function mapSection(section: AnyDoc): ContentSection {
  return {
    id: section.$id,
    name: stringValue(section.name, "Untitled Section"),
    slug: stringValue(section.slug, section.$id),
    description: stringValue(section.description, "Independent ASCENT archive."),
    icon: stringValue(section.icon, "A").slice(0, 2),
    accentColor: stringValue(section.accentColor, "#ff3b30"),
    theme: ["terminal", "physics", "gym", "philosophy", "ai", "archive"].includes(String(section.theme)) ? (section.theme as ContentSection["theme"]) : "terminal",
    bannerUrl: stringValue(section.bannerUrl) || null,
    layout: ["timeline", "magazine", "research", "gallery"].includes(String(section.layout)) ? (section.layout as ContentSection["layout"]) : "timeline",
    visibility: section.visibility === "private" ? "private" : "public",
    commentsEnabled: boolValue(section.commentsEnabled, true),
    featured: boolValue(section.featured, false),
    archived: boolValue(section.archived, false),
    sortOrder: numberValue(section.sortOrder, 0),
    parentId: stringValue(section.parentId) || null,
    moderatorIds: stringArray(section.moderatorIds),
    createdAt: section.$createdAt,
  };
}

function mapMedia(media: AnyDoc): PostMedia {
  return {
    id: media.$id,
    kind: ["image", "gif", "video", "embed"].includes(String(media.kind)) ? (media.kind as PostMedia["kind"]) : "image",
    url: stringValue(media.url),
    alt: stringValue(media.alt, "Mission media"),
    width: numberValue(media.width, 0) || undefined,
    height: numberValue(media.height, 0) || undefined,
    orientation: ["landscape", "portrait", "square", "cinematic"].includes(String(media.orientation)) ? (media.orientation as PostMedia["orientation"]) : undefined,
  };
}

function deletedAuthor(): Comment["author"] {
  return {
    id: "deleted-user",
    username: "deleted",
    displayName: "Deleted User",
    avatarUrl: null,
    role: "user",
    status: "unknown",
  };
}

function mapComment(comment: AnyDoc, author?: Profile): Comment {
  return {
    id: comment.$id,
    postId: stringValue(comment.postId),
    parentId: stringValue(comment.parentId) || null,
    body: stringValue(comment.body),
    createdAt: stringValue(comment.createdAt, comment.$createdAt),
    updatedAt: stringValue(comment.updatedAt) || null,
    reactions: parseJson(comment.reactionsJson, []),
    isDeleted: boolValue(comment.isDeleted, false),
    author: author
      ? {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
          avatarUrl: author.avatarUrl,
          role: author.role,
          status: author.status,
        }
      : deletedAuthor(),
  };
}

function sectionFallback(sectionId: string, sections: ContentSection[]) {
  return sections.find((section) => section.id === sectionId || section.slug === sectionId) ?? defaultSections[0];
}

function mapPost(post: AnyDoc, media: AnyDoc[] = [], comments: Comment[] = [], sections = defaultSections): Post {
  const section = sectionFallback(stringValue(post.sectionId, "mission-log"), sections);

  return {
    id: post.$id,
    sectionId: stringValue(post.sectionId, section.id),
    sectionSlug: stringValue(post.sectionSlug, section.slug),
    sectionName: stringValue(post.sectionName, section.name),
    dayNumber: numberValue(post.dayNumber, 1),
    slug: stringValue(post.slug, post.$id),
    title: stringValue(post.title, "Untitled Mission Log"),
    excerpt: stringValue(post.excerpt, "Mission log entry."),
    content: stringValue(post.content),
    publishedAt: stringValue(post.publishedAt, post.$createdAt),
    missionDate: stringValue(post.missionDate, post.$createdAt.slice(0, 10)),
    status: ["draft", "published", "archived"].includes(String(post.status)) ? (post.status as Post["status"]) : "published",
    objective: stringValue(post.objective),
    failures: stringValue(post.failures),
    lessons: stringValue(post.lessons),
    tags: stringArray(post.tags),
    studyHours: numberValue(post.studyHours, 0),
    weightKg: numberValue(post.weightKg, 0),
    codingProgress: numberValue(post.codingProgress, 0),
    gymComplete: boolValue(post.gymComplete, false),
    physicsProgress: numberValue(post.physicsProgress, 0),
    streakAfterPost: numberValue(post.streakAfterPost, 0),
    featured: boolValue(post.featured, false),
    pinned: boolValue(post.pinned, false),
    media: media.map(mapMedia),
    comments,
  };
}

function mapFailure(failure: AnyDoc): FailureEvent {
  return {
    id: failure.$id,
    dayNumber: numberValue(failure.dayNumber, 0) || null,
    failureDate: stringValue(failure.failureDate, failure.$createdAt.slice(0, 10)),
    reason: stringValue(failure.reason),
    severity: failure.severity === "warning" ? "warning" : "critical",
    autoPostedToInstagram: boolValue(failure.autoPostedToInstagram, false),
    instagramPermalink: stringValue(failure.instagramPermalink) || null,
    createdAt: failure.$createdAt,
  };
}

function mapMissionSettings(settings: AnyDoc | null): MissionSettings {
  if (!settings) return defaultMissionSettings;

  return {
    applicationDeadline: stringValue(settings.applicationDeadline, defaultMissionSettings.applicationDeadline),
    decisionHorizon: stringValue(settings.decisionHorizon, defaultMissionSettings.decisionHorizon),
    missionTimeZone: stringValue(settings.missionTimeZone, defaultMissionSettings.missionTimeZone),
    missedDayCutoffHour: numberValue(settings.missedDayCutoffHour, defaultMissionSettings.missedDayCutoffHour),
    countdownLabel: stringValue(settings.countdownLabel, defaultMissionSettings.countdownLabel),
    countdownDescription: stringValue(settings.countdownDescription, defaultMissionSettings.countdownDescription),
    operatorName: stringValue(settings.operatorName, defaultMissionSettings.operatorName),
    operatorTitle: stringValue(settings.operatorTitle, defaultMissionSettings.operatorTitle),
    operatorBio: stringValue(settings.operatorBio, defaultMissionSettings.operatorBio),
    nextActionCopy: stringValue(settings.nextActionCopy, defaultMissionSettings.nextActionCopy),
    failureMessageTemplate: stringValue(settings.failureMessageTemplate, defaultMissionSettings.failureMessageTemplate),
    instagramWebhookUrl: stringValue(settings.instagramWebhookUrl),
    automationEnabled: boolValue(settings.automationEnabled, defaultMissionSettings.automationEnabled ?? true),
  };
}

function buildDailyMetrics(posts: Post[]) {
  if (!posts.length) return dashboardSnapshot.dailyMetrics;

  return [...posts]
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .slice(-6)
    .map((post) => ({
      date: `D${String(post.dayNumber).padStart(3, "0")}`,
      studyHours: post.studyHours,
      gymComplete: post.gymComplete,
      physicsPercent: post.physicsProgress,
      streak: post.streakAfterPost,
    }));
}

async function adminDatabases() {
  return createAdminClient()?.databases ?? null;
}

export async function getSections(includePrivate = false) {
  const databases = await adminDatabases();
  if (!databases) return defaultSections.filter((section) => includePrivate || section.visibility === "public");

  try {
    const response = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.sections,
      queries: [Query.orderAsc("sortOrder"), Query.limit(100)],
    });

    const sections = response.documents.map((doc) => mapSection(doc as AnyDoc));
    return sections.length ? sections.filter((section) => includePrivate || (section.visibility === "public" && !section.archived)) : defaultSections;
  } catch {
    return defaultSections.filter((section) => includePrivate || section.visibility === "public");
  }
}

async function fetchAuthorMap(comments: AnyDoc[]) {
  const databases = await adminDatabases();
  if (!databases) return new Map<string, Profile>();

  const ids = Array.from(new Set(comments.map((comment) => stringValue(comment.authorId)).filter(Boolean)));
  const map = new Map<string, Profile>();

  await Promise.all(
    ids.map(async (id) => {
      try {
        const profile = await databases.getDocument({ databaseId: appwriteConfig.databaseId, collectionId: c.profiles, documentId: id });
        map.set(id, mapProfile(profile as AnyDoc));
      } catch {
        // Missing profile documents should not break public archive rendering.
      }
    }),
  );

  return map;
}

async function fetchPostsWithRelations(limit?: number, sectionSlug?: string) {
  const databases = await adminDatabases();
  if (!databases) return seedPosts.slice(0, limit ?? seedPosts.length);

  try {
    const sections = await getSections(true);
    const queries = [Query.equal("status", "published"), Query.orderDesc("dayNumber"), Query.limit(limit ?? 100)];
    if (sectionSlug) queries.unshift(Query.equal("sectionSlug", sectionSlug));

    const postRows = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.posts,
      queries,
    });

    if (!postRows.documents.length) return [];

    const ids = postRows.documents.map((post) => post.$id);
    const [mediaRows, commentRows] = await Promise.all([
      databases.listDocuments({
        databaseId: appwriteConfig.databaseId,
        collectionId: c.postMedia,
        queries: [Query.equal("postId", ids), Query.orderAsc("sortOrder"), Query.limit(500)],
      }),
      databases.listDocuments({
        databaseId: appwriteConfig.databaseId,
        collectionId: c.comments,
        queries: [Query.equal("postId", ids), Query.equal("isDeleted", false), Query.orderAsc("createdAt"), Query.limit(500)],
      }),
    ]);

    const authorMap = await fetchAuthorMap(commentRows.documents as AnyDoc[]);
    const comments = (commentRows.documents as AnyDoc[]).map((comment) => mapComment(comment, authorMap.get(stringValue(comment.authorId))));

    return (postRows.documents as AnyDoc[]).map((post) =>
      mapPost(
        post,
        (mediaRows.documents as AnyDoc[]).filter((media) => stringValue(media.postId) === post.$id),
        comments.filter((comment) => comment.postId === post.$id),
        sections,
      ),
    );
  } catch {
    return seedPosts.slice(0, limit ?? seedPosts.length);
  }
}

export async function getPosts(limit?: number) {
  return fetchPostsWithRelations(limit);
}

export async function getPostsBySection(sectionSlug: string, limit?: number) {
  return fetchPostsWithRelations(limit, sectionSlug);
}

export async function getPostBySlug(slug: string) {
  const databases = await adminDatabases();
  if (!databases) return seedPosts.find((post) => post.slug === slug) ?? null;

  try {
    const response = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.posts,
      queries: [Query.equal("slug", slug), Query.equal("status", "published"), Query.limit(1)],
    });

    const postRow = response.documents[0] as AnyDoc | undefined;
    if (!postRow) return null;

    const [sections, mediaRows, commentRows] = await Promise.all([
      getSections(true),
      databases.listDocuments({ databaseId: appwriteConfig.databaseId, collectionId: c.postMedia, queries: [Query.equal("postId", postRow.$id), Query.orderAsc("sortOrder"), Query.limit(100)] }),
      databases.listDocuments({ databaseId: appwriteConfig.databaseId, collectionId: c.comments, queries: [Query.equal("postId", postRow.$id), Query.equal("isDeleted", false), Query.orderAsc("createdAt"), Query.limit(300)] }),
    ]);

    const authorMap = await fetchAuthorMap(commentRows.documents as AnyDoc[]);
    const comments = (commentRows.documents as AnyDoc[]).map((comment) => mapComment(comment, authorMap.get(stringValue(comment.authorId))));
    return mapPost(postRow, mediaRows.documents as AnyDoc[], comments, sections);
  } catch {
    return seedPosts.find((post) => post.slug === slug) ?? null;
  }
}

export async function getFailures() {
  const databases = await adminDatabases();
  if (!databases) return seedFailures;

  try {
    const response = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.failureEvents,
      queries: [Query.orderDesc("failureDate"), Query.limit(100)],
    });

    return (response.documents as AnyDoc[]).map(mapFailure);
  } catch {
    return seedFailures;
  }
}

export async function getMissionSettings() {
  const databases = await adminDatabases();
  if (!databases) return defaultMissionSettings;

  try {
    const settings = await databases.getDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.missionSettings,
      documentId: "singleton",
    });
    return mapMissionSettings(settings as AnyDoc);
  } catch {
    return defaultMissionSettings;
  }
}

export async function getCurrentProfile() {
  const session = await createSessionClient();
  const databases = await adminDatabases();
  if (!session || !databases) return null;

  try {
    const user = await session.account.get();
    const profile = await databases.getDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.profiles,
      documentId: user.$id,
    });
    return mapProfile(profile as AnyDoc);
  } catch {
    return null;
  }
}

export async function requireAdminProfile() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") notFound();
  return profile;
}

export async function getProfileById(profileId: string) {
  const databases = await adminDatabases();
  if (!databases) return null;

  try {
    const profile = await databases.getDocument({ databaseId: appwriteConfig.databaseId, collectionId: c.profiles, documentId: profileId });
    return mapProfile(profile as AnyDoc);
  } catch {
    return null;
  }
}

export async function getProfileByUsername(username: string) {
  const databases = await adminDatabases();
  if (!databases) return findDemoProfile(username);

  try {
    const response = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.profiles,
      queries: [Query.equal("usernameLower", username.toLowerCase()), Query.limit(1)],
    });

    const profileRow = response.documents[0] as AnyDoc | undefined;
    if (!profileRow) return findDemoProfile(username);

    const comments = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: c.comments,
      queries: [Query.equal("authorId", profileRow.$id), Query.equal("isDeleted", false), Query.limit(1)],
      total: true,
    });

    return mapProfile(profileRow, comments.total ?? 0);
  } catch {
    return findDemoProfile(username);
  }
}

export async function getProfileComments(profileId: string) {
  const databases = await adminDatabases();
  if (!databases) return seedPosts.flatMap((post) => post.comments).filter((comment) => comment.author.id === profileId);

  try {
    const [profile, response] = await Promise.all([
      getProfileById(profileId),
      databases.listDocuments({
        databaseId: appwriteConfig.databaseId,
        collectionId: c.comments,
        queries: [Query.equal("authorId", profileId), Query.equal("isDeleted", false), Query.orderDesc("createdAt"), Query.limit(25)],
      }),
    ]);

    return (response.documents as AnyDoc[]).map((comment) => mapComment(comment, profile ?? undefined));
  } catch {
    return [];
  }
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [posts, failures, profile, settings, sections] = await Promise.all([getPosts(12), getFailures(), getCurrentProfile(), getMissionSettings(), getSections(true)]);

  const latestPost = posts[0] ?? null;
  const currentStreak = latestPost ? latestPost.streakAfterPost : 0;
  const studyHours = latestPost ? latestPost.studyHours : 0;
  const physicsProgress = latestPost ? latestPost.physicsProgress : 0;
  const weightProgress = latestPost ? latestPost.weightKg : 0;
  const codingProgress = latestPost ? latestPost.codingProgress : 0;
  const gymWindow = posts.slice(0, 14);
  const gymConsistency = gymWindow.length
    ? Math.round((gymWindow.filter((post) => post.gymComplete).length / gymWindow.length) * 100)
    : 0;

  const missionStarted = posts.length > 0;

  return {
    ...dashboardSnapshot,
    profile: profile ?? dashboardSnapshot.profile,
    settings,
    sections,
    posts,
    latestPost,
    failures,
    dailyMetrics: buildDailyMetrics(posts),
    visitorCount: missionStarted ? dashboardSnapshot.visitorCount : 0,
    engagementRate: missionStarted ? dashboardSnapshot.engagementRate : 0,
    analytics: missionStarted ? dashboardSnapshot.analytics : dashboardSnapshot.analytics.map((point) => ({ ...point, visitors: 0, comments: 0, studyHours: 0, consistency: 0 })),
    metrics: [
      { label: "Current streak", value: `${String(currentStreak).padStart(3, "0")} days`, delta: missionStarted ? "+1 if posted before cutoff" : "mission not started", status: currentStreak > 0 ? "stable" : "warning" },
      { label: "Today study", value: `${studyHours.toFixed(1)} h`, delta: missionStarted ? "latest public log" : "awaiting Day 001", status: studyHours >= 4 ? "stable" : "warning" },
      { label: "Gym consistency", value: `${gymConsistency}%`, delta: missionStarted ? "recent post window" : "awaiting Day 001", status: gymConsistency >= 70 ? "stable" : "warning" },
      { label: "Physics progress", value: `${physicsProgress}%`, delta: missionStarted ? "active unit" : "awaiting Day 001", status: physicsProgress > 0 ? "stable" : "warning" },
      { label: "Weight progress", value: weightProgress ? `${weightProgress.toFixed(1)} kg` : "0.0 kg", delta: missionStarted ? "latest body metric" : "awaiting baseline", status: weightProgress > 0 ? "stable" : "warning" },
      { label: "Coding progress", value: `${codingProgress}%`, delta: missionStarted ? "active project arc" : "awaiting projects", status: codingProgress > 0 ? "stable" : "warning" },
    ],
  };
}
