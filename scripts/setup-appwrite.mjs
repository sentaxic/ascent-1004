#!/usr/bin/env node
/**
 * ASCENT-1004 — Appwrite provisioning script
 * ------------------------------------------------------------------
 * Creates the database, all 9 collections (with attributes + indexes),
 * and the 2 storage buckets that the app expects, then seeds the
 * mission_settings singleton and the default content sections.
 *
 * It is IDEMPOTENT: re-running skips anything that already exists, so
 * it is safe to run repeatedly while you iterate.
 *
 * Usage:
 *   1. Fill NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID
 *      and APPWRITE_API_KEY in .env.local (a server API key with the
 *      `databases.*` and `buckets.*` scopes — Appwrite console → Overview
 *      → Integrations → API keys).
 *   2. node scripts/setup-appwrite.mjs            (provision + seed)
 *      node scripts/setup-appwrite.mjs --no-seed  (schema only)
 *
 * Attribute names, types and indexes mirror exactly what src/lib/data.ts
 * reads and the server actions write — keep them in sync if you change
 * the data model.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Client, Databases, Storage, Permission, Role, DatabasesIndexType } from "node-appwrite";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

// --- minimal .env loader (no dependency) ---------------------------------
function loadEnvFile(file) {
  const path = join(projectRoot, file);
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

// --- config (defaults MUST match src/lib/config.ts) ----------------------
const cfg = {
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

const SEED = !process.argv.includes("--no-seed");

if (!cfg.endpoint || !cfg.projectId || !cfg.apiKey) {
  console.error("\n✖ Missing Appwrite credentials. Set these in .env.local first:\n");
  console.error("    NEXT_PUBLIC_APPWRITE_ENDPOINT   (e.g. https://cloud.appwrite.io/v1)");
  console.error("    NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  console.error("    APPWRITE_API_KEY                (server key with databases + buckets scopes)\n");
  process.exit(1);
}

const client = new Client().setEndpoint(cfg.endpoint).setProject(cfg.projectId).setKey(cfg.apiKey);
const databases = new Databases(client);
const storage = new Storage(client);

// --- helpers -------------------------------------------------------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Run a create call, treating "already exists" (409) as success.
async function ensure(label, fn) {
  try {
    await fn();
    console.log(`  ✓ created   ${label}`);
  } catch (error) {
    if (error?.code === 409) {
      console.log(`  • exists    ${label}`);
      return;
    }
    console.error(`  ✖ FAILED    ${label}: ${error?.message ?? error}`);
    throw error;
  }
}

// Attribute definition shorthands.
const str = (key, size, array = false) => ({ type: "string", key, size, array });
const int = (key, array = false) => ({ type: "integer", key, array });
const dbl = (key) => ({ type: "double", key });
const bool = (key) => ({ type: "boolean", key });

async function createAttribute(collectionId, attr) {
  const base = { databaseId: cfg.databaseId, collectionId, key: attr.key, required: false };
  if (attr.type === "string") {
    await databases.createStringAttribute({ ...base, size: attr.size, array: Boolean(attr.array) });
  } else if (attr.type === "integer") {
    await databases.createIntegerAttribute({ ...base, array: Boolean(attr.array) });
  } else if (attr.type === "double") {
    await databases.createFloatAttribute({ ...base });
  } else if (attr.type === "boolean") {
    await databases.createBooleanAttribute({ ...base });
  }
}

// Appwrite creates attributes asynchronously; indexes (and documents) need
// them to be "available" first. Poll until every attribute settles.
async function waitForAttributes(collectionId, keys) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const { attributes } = await databases.listAttributes({ databaseId: cfg.databaseId, collectionId });
    const byKey = new Map(attributes.map((a) => [a.key, a.status]));
    const pending = keys.filter((k) => byKey.get(k) !== "available");
    const failed = keys.filter((k) => ["failed", "stuck"].includes(byKey.get(k)));
    if (failed.length) throw new Error(`Attributes failed to build on ${collectionId}: ${failed.join(", ")}`);
    if (!pending.length) return;
    await sleep(1500);
  }
  throw new Error(`Timed out waiting for attributes on ${collectionId}`);
}

const PUBLIC_READ = [Permission.read(Role.any())];
const ADMIN_ONLY = [Permission.read(Role.label("admin"))];

// --- schema (mirrors src/lib/data.ts mappers + action write payloads) ----
const collections = [
  {
    id: cfg.collections.profiles,
    name: "Profiles",
    permissions: PUBLIC_READ,
    attributes: [
      str("username", 255), str("usernameLower", 255), str("displayName", 255),
      str("role", 50), str("avatarUrl", 2048), str("bannerUrl", 2048),
      str("bio", 5000), str("socialLinksJson", 16000),
      int("activityScore"), int("streak"), str("badges", 100, true), str("status", 50),
    ],
    indexes: [{ key: "idx_usernameLower", attributes: ["usernameLower"] }],
  },
  {
    id: cfg.collections.sections,
    name: "Sections",
    permissions: PUBLIC_READ,
    attributes: [
      str("name", 255), str("slug", 255), str("description", 2000), str("icon", 8),
      str("accentColor", 32), str("theme", 32), str("bannerUrl", 2048), str("layout", 32),
      str("visibility", 32), bool("commentsEnabled"), bool("featured"), bool("archived"),
      int("sortOrder"), str("parentId", 255), str("moderatorIds", 255, true),
    ],
    indexes: [
      { key: "idx_sortOrder", attributes: ["sortOrder"] },
      { key: "idx_slug", attributes: ["slug"] },
    ],
  },
  {
    id: cfg.collections.posts,
    name: "Posts",
    permissions: PUBLIC_READ,
    attributes: [
      str("authorId", 255), str("sectionId", 255), str("sectionSlug", 255), str("sectionName", 255),
      int("dayNumber"), str("slug", 255), str("title", 500), str("excerpt", 1000),
      str("content", 100000), str("publishedAt", 64), str("missionDate", 16), str("status", 32),
      str("objective", 5000), str("failures", 5000), str("lessons", 5000), str("tags", 64, true),
      dbl("studyHours"), dbl("weightKg"), int("codingProgress"), int("physicsProgress"),
      bool("gymComplete"), int("streakAfterPost"), bool("featured"), bool("pinned"),
    ],
    indexes: [
      { key: "idx_status", attributes: ["status"] },
      { key: "idx_dayNumber", attributes: ["dayNumber"] },
      { key: "idx_slug", attributes: ["slug"] },
      { key: "idx_missionDate", attributes: ["missionDate"] },
      { key: "idx_sectionSlug", attributes: ["sectionSlug"] },
    ],
  },
  {
    id: cfg.collections.postMedia,
    name: "Post Media",
    permissions: PUBLIC_READ,
    attributes: [
      str("postId", 255), str("kind", 50), str("url", 2048), str("alt", 500),
      int("width"), int("height"), str("orientation", 50), int("sortOrder"),
    ],
    indexes: [
      { key: "idx_postId", attributes: ["postId"] },
      { key: "idx_sortOrder", attributes: ["sortOrder"] },
    ],
  },
  {
    id: cfg.collections.comments,
    name: "Comments",
    permissions: PUBLIC_READ,
    attributes: [
      str("postId", 255), str("authorId", 255), str("parentId", 255), str("body", 1600),
      str("createdAt", 64), str("updatedAt", 64), str("reactionsJson", 10000), bool("isDeleted"),
    ],
    indexes: [
      { key: "idx_postId", attributes: ["postId"] },
      { key: "idx_authorId", attributes: ["authorId"] },
      { key: "idx_isDeleted", attributes: ["isDeleted"] },
      { key: "idx_createdAt", attributes: ["createdAt"] },
    ],
  },
  {
    id: cfg.collections.failureEvents,
    name: "Failure Events",
    permissions: PUBLIC_READ,
    attributes: [
      int("dayNumber"), str("failureDate", 16), str("reason", 2000), str("severity", 50),
      bool("autoPostedToInstagram"), str("instagramPermalink", 500),
    ],
    indexes: [{ key: "idx_failureDate", attributes: ["failureDate"] }],
  },
  {
    id: cfg.collections.missionSettings,
    name: "Mission Settings",
    permissions: PUBLIC_READ,
    attributes: [
      str("applicationDeadline", 64), str("decisionHorizon", 64), str("missionTimeZone", 100),
      int("missedDayCutoffHour"), str("countdownLabel", 500), str("countdownDescription", 2000),
      str("operatorName", 255), str("operatorTitle", 255), str("operatorBio", 2000),
      str("nextActionCopy", 1000), str("failureMessageTemplate", 1000),
      str("instagramWebhookUrl", 500), bool("automationEnabled"),
    ],
    indexes: [],
  },
  {
    id: cfg.collections.visitorEvents,
    name: "Visitor Events",
    permissions: ADMIN_ONLY, // private telemetry
    attributes: [
      str("path", 300), str("referrer", 500), str("userAgent", 1000),
      str("ipHash", 255), str("createdAt", 64),
    ],
    indexes: [],
  },
  {
    id: cfg.collections.automationLogs,
    name: "Automation Logs",
    permissions: ADMIN_ONLY, // reserved for future automation logging
    attributes: [
      str("event", 100), str("status", 50), str("detail", 100000), str("createdAt", 64),
    ],
    indexes: [],
  },
];

// --- run -----------------------------------------------------------------
async function main() {
  console.log(`\nProvisioning Appwrite for ASCENT-1004`);
  console.log(`  endpoint : ${cfg.endpoint}`);
  console.log(`  project  : ${cfg.projectId}`);
  console.log(`  database : ${cfg.databaseId}\n`);

  console.log("Database");
  await ensure(`database "${cfg.databaseId}"`, () =>
    databases.create({ databaseId: cfg.databaseId, name: "ASCENT-1004" }),
  );

  for (const collection of collections) {
    console.log(`\nCollection: ${collection.id}`);
    await ensure(`collection "${collection.id}"`, () =>
      databases.createCollection({
        databaseId: cfg.databaseId,
        collectionId: collection.id,
        name: collection.name,
        permissions: collection.permissions,
        documentSecurity: true,
      }),
    );

    for (const attr of collection.attributes) {
      await ensure(`attr ${collection.id}.${attr.key}`, () => createAttribute(collection.id, attr));
    }

    await waitForAttributes(collection.id, collection.attributes.map((a) => a.key));

    for (const index of collection.indexes) {
      await ensure(`index ${collection.id}.${index.key}`, () =>
        databases.createIndex({
          databaseId: cfg.databaseId,
          collectionId: collection.id,
          key: index.key,
          type: DatabasesIndexType.Key,
          attributes: index.attributes,
        }),
      );
    }
  }

  console.log(`\nStorage buckets`);
  for (const bucket of [
    { id: cfg.profileBucketId, name: "Profiles" },
    { id: cfg.postMediaBucketId, name: "Post Media" },
  ]) {
    await ensure(`bucket "${bucket.id}"`, () =>
      storage.createBucket({
        bucketId: bucket.id,
        name: bucket.name,
        permissions: PUBLIC_READ,
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 50 * 1024 * 1024, // 50 MB — room for cinematic images / short video
        encryption: false, // off so files >20MB (video) are allowed
        antivirus: false,
      }),
    );
  }

  if (SEED) await seed();

  console.log(`\n✔ Done. Appwrite is provisioned${SEED ? " and seeded" : ""}.`);
  console.log(`  Next: register your domain as a Web platform in the Appwrite console,`);
  console.log(`  create the admin user, then run the app.\n`);
}

// --- seed data (mission settings singleton + default sections) -----------
async function seed() {
  console.log(`\nSeeding`);

  await ensure(`mission_settings singleton`, () =>
    databases.createDocument({
      databaseId: cfg.databaseId,
      collectionId: cfg.collections.missionSettings,
      documentId: "singleton",
      data: {
        applicationDeadline: "2029-01-05T23:59:59+05:30",
        decisionHorizon: "2029-03-14T15:14:00+05:30",
        missionTimeZone: "Asia/Kolkata",
        missedDayCutoffHour: 22,
        countdownLabel: "primary countdown / MIT application horizon",
        countdownDescription:
          "10th grade long-range mission. Edit this timer and mission copy from the admin console whenever the target changes.",
        operatorName: "Micheal",
        operatorTitle: "admin / publish authority",
        operatorBio:
          "Only the admin account can publish logs, moderate comments, view analytics, and upload official mission media.",
        nextActionCopy: "Publish {day} before cutoff, log study hours, attach evidence, keep the system honest.",
        failureMessageTemplate:
          "ASCENT-1004 FAILURE ARCHIVE: {date}. Daily public log missed before cutoff. {day} remains unpaid.",
        instagramWebhookUrl: "",
        automationEnabled: true,
      },
      permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin"))],
    }),
  );

  const sections = [
    { slug: "mission-log", name: "ASCENT Mission Log", description: "The central daily transformation archive: MIT, physics, fitness, study, failures, and discipline.", icon: "A", accentColor: "#ff3b30", theme: "terminal", layout: "timeline", featured: true, sortOrder: 0 },
    { slug: "physics-research", name: "Physics Research", description: "Research notes, derivations, problem sets, experiments, and conceptual breakthroughs.", icon: "P", accentColor: "#5aa7ff", theme: "physics", layout: "research", featured: true, sortOrder: 1 },
    { slug: "devlog", name: "Devlog", description: "Code experiments, product decisions, debugging notes, and shipped systems.", icon: "D", accentColor: "#80d68f", theme: "terminal", layout: "timeline", featured: true, sortOrder: 2 },
    { slug: "gym-journal", name: "Gym Journal", description: "Training logs, body metrics, consistency streaks, and physical discipline receipts.", icon: "G", accentColor: "#f97316", theme: "gym", layout: "magazine", featured: true, sortOrder: 3 },
    { slug: "philosophical-notes", name: "Philosophical Notes", description: "Quiet reflections on identity, obsession, ambition, fear, and becoming difficult to stop.", icon: "N", accentColor: "#c9b8ff", theme: "philosophy", layout: "magazine", featured: false, sortOrder: 4 },
  ];

  for (const section of sections) {
    await ensure(`section "${section.slug}"`, () =>
      databases.createDocument({
        databaseId: cfg.databaseId,
        collectionId: cfg.collections.sections,
        documentId: section.slug,
        data: {
          name: section.name,
          slug: section.slug,
          description: section.description,
          icon: section.icon,
          accentColor: section.accentColor,
          theme: section.theme,
          bannerUrl: "",
          layout: section.layout,
          visibility: "public",
          commentsEnabled: true,
          featured: section.featured,
          archived: false,
          sortOrder: section.sortOrder,
          parentId: "",
          moderatorIds: [],
        },
        permissions: [
          Permission.read(Role.any()),
          Permission.update(Role.label("admin")),
          Permission.delete(Role.label("admin")),
        ],
      }),
    );
  }
}

main().catch((error) => {
  console.error("\n✖ Provisioning aborted:", error?.message ?? error);
  process.exit(1);
});
