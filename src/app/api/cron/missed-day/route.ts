import { NextResponse, type NextRequest } from "next/server";

import { missionDateKey, siteConfig } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, mode: "demo", message: "Supabase admin env not configured" });

  const now = new Date();
  const today = missionDateKey(now);

  const { data: todayPost } = await supabase
    .from("posts")
    .select("id")
    .eq("mission_date", today)
    .eq("status", "published")
    .maybeSingle();

  if (todayPost) return NextResponse.json({ ok: true, status: "posted", today });

  const { data: existingFailure } = await supabase
    .from("failure_events")
    .select("id")
    .eq("failure_date", today)
    .maybeSingle();

  if (existingFailure) return NextResponse.json({ ok: true, status: "already_archived", today });

  const { data: latestPost } = await supabase
    .from("posts")
    .select("day_number, streak_after_post")
    .eq("status", "published")
    .order("day_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextDay = Number(latestPost?.day_number ?? 0) + 1;
  const caption = `ASCENT-1004 FAILURE ARCHIVE: ${today}. ${siteConfig.adminUsername} missed the daily public log before cutoff. Streak failure recorded. DAY ${String(nextDay).padStart(3, "0")} remains unpaid.`;

  let instagram = { posted: false, permalink: null as string | null, provider: "not_attempted" };

  try {
    instagram = await publishInstagramFailure(caption);
  } catch (error) {
    instagram = { posted: false, permalink: null, provider: error instanceof Error ? error.message : "instagram_failed" };
  }

  const { error } = await supabase.from("failure_events").insert({
    day_number: nextDay,
    failure_date: today,
    reason: `No public post was published before the daily cutoff hour (${siteConfig.missedDayCutoffHour}:00 ${siteConfig.missionTimeZone}).`,
    severity: "critical",
    auto_posted_to_instagram: instagram.posted,
    instagram_permalink: instagram.permalink,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: "failure_archived", today, instagram });
}
