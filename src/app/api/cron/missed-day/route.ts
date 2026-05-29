import { NextResponse, type NextRequest } from "next/server";
import { ID, Permission, Query, Role } from "node-appwrite";

import { appwriteConfig, missionDateKey, siteConfig } from "@/lib/config";
import { defaultMissionSettings } from "@/lib/seed-data";
import { createAdminClient } from "@/lib/appwrite/server";

type AdminDatabases = NonNullable<ReturnType<typeof createAdminClient>>["databases"];

async function getCronSettings(databases: AdminDatabases) {
  try {
    const settings = await databases.getDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.missionSettings,
      documentId: "singleton",
    });

    return {
      missionTimeZone: (settings.missionTimeZone as string) || defaultMissionSettings.missionTimeZone,
      missedDayCutoffHour: Number(settings.missedDayCutoffHour ?? defaultMissionSettings.missedDayCutoffHour),
    };
  } catch {
    return {
      missionTimeZone: defaultMissionSettings.missionTimeZone,
      missedDayCutoffHour: defaultMissionSettings.missedDayCutoffHour,
    };
  }
}

function localHour(date: Date, timeZone: string) {
  const hour = new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return Number(hour);
}

async function publishInstagramFailure(caption: string) {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_GRAPH_TOKEN;
  const imageUrl = process.env.INSTAGRAM_FAILURE_IMAGE_URL;
  const webhook = process.env.INSTAGRAM_MISSED_DAY_WEBHOOK_URL;

  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ caption, event: "ASCENT_1004_MISSED_DAY" }),
    });
    return { posted: response.ok, permalink: null, provider: "webhook" };
  }

  if (!accountId || !token || !imageUrl) {
    return { posted: false, permalink: null, provider: "not_configured" };
  }

  const createContainer = await fetch(`https://graph.facebook.com/v20.0/${accountId}/media`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
  });

  const container = (await createContainer.json()) as { id?: string; error?: { message?: string } };
  if (!createContainer.ok || !container.id) {
    throw new Error(container.error?.message ?? "Instagram container creation failed");
  }

  const publish = await fetch(`https://graph.facebook.com/v20.0/${accountId}/media_publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ creation_id: container.id, access_token: token }),
  });

  const result = (await publish.json()) as { id?: string; error?: { message?: string } };
  if (!publish.ok || !result.id) throw new Error(result.error?.message ?? "Instagram publish failed");

  return { posted: true, permalink: `https://www.instagram.com/p/${result.id}`, provider: "instagram_graph" };
}

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  const incomingSecret = request.headers.get("authorization")?.replace("Bearer ", "");

  if (configuredSecret && incomingSecret !== configuredSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true, mode: "demo", message: "Appwrite admin env not configured" });

  const databases = admin.databases;
  const now = new Date();
  const settings = await getCronSettings(databases);
  const today = missionDateKey(now, settings.missionTimeZone);

  if (localHour(now, settings.missionTimeZone) < settings.missedDayCutoffHour) {
    return NextResponse.json({ ok: true, status: "before_cutoff", today, cutoffHour: settings.missedDayCutoffHour });
  }

  const todayPost = await databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.collections.posts,
    queries: [Query.equal("missionDate", today), Query.equal("status", "published"), Query.limit(1)],
  });

  if (todayPost.total > 0) return NextResponse.json({ ok: true, status: "posted", today });

  const existingFailure = await databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.collections.failureEvents,
    queries: [Query.equal("failureDate", today), Query.limit(1)],
  });

  if (existingFailure.total > 0) return NextResponse.json({ ok: true, status: "already_archived", today });

  const latest = await databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.collections.posts,
    queries: [Query.equal("status", "published"), Query.orderDesc("dayNumber"), Query.limit(1)],
  });

  const latestPost = latest.documents[0];
  if (!latestPost) {
    return NextResponse.json({
      ok: true,
      status: "mission_not_started",
      today,
      message: "No failure is recorded before the first real Day 001 post exists.",
    });
  }

  const nextDay = Number(latestPost.dayNumber) + 1;
  const caption = `ASCENT-1004 FAILURE ARCHIVE: ${today}. ${siteConfig.adminUsername} missed the daily public log before cutoff. Streak failure recorded. DAY ${String(nextDay).padStart(3, "0")} remains unpaid.`;

  let instagram: { posted: boolean; permalink: string | null; provider: string } = {
    posted: false,
    permalink: null,
    provider: "not_attempted",
  };

  try {
    instagram = await publishInstagramFailure(caption);
  } catch (error) {
    instagram = { posted: false, permalink: null, provider: error instanceof Error ? error.message : "instagram_failed" };
  }

  try {
    await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.failureEvents,
      documentId: ID.unique(),
      data: {
        dayNumber: nextDay,
        failureDate: today,
        reason: `No public post was published before the daily cutoff hour (${settings.missedDayCutoffHour}:00 ${settings.missionTimeZone}).`,
        severity: "critical",
        autoPostedToInstagram: instagram.posted,
        instagramPermalink: instagram.permalink,
      },
      permissions: [Permission.read(Role.any())],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to archive failure" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, status: "failure_archived", today, instagram });
}
