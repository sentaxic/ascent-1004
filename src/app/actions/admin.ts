"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

async function assertAdminSession() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login?error=Supabase%20is%20not%20configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/?error=Admin%20permission%20required");

  return { supabase, user };
}


function assertValidDate(value: string, field: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    redirect(`/admin?error=${encodeURIComponent(`${field} must be a valid ISO date/time`)}`);
  }
  return value;
}

export async function updateMissionSettingsAction(formData: FormData) {
  const { supabase } = await assertAdminSession();

  const applicationDeadline = assertValidDate(getString(formData, "applicationDeadline"), "MIT deadline");
  const decisionHorizon = assertValidDate(getString(formData, "decisionHorizon"), "Pi Day horizon");
  const missionTimeZone = getString(formData, "missionTimeZone") || "Asia/Kolkata";
  const missedDayCutoffHour = Math.min(Math.max(Math.floor(getNumber(formData, "missedDayCutoffHour", 22)), 0), 23);
  const countdownLabel = getString(formData, "countdownLabel");
  const countdownDescription = getString(formData, "countdownDescription");
  const operatorName = getString(formData, "operatorName");
  const operatorTitle = getString(formData, "operatorTitle");
  const operatorBio = getString(formData, "operatorBio");
  const nextActionCopy = getString(formData, "nextActionCopy");

  const { error } = await supabase.from("mission_settings").upsert({
    id: true,
    application_deadline: applicationDeadline,
    decision_horizon: decisionHorizon,
    mission_time_zone: missionTimeZone,
    missed_day_cutoff_hour: missedDayCutoffHour,
    countdown_label: countdownLabel,
    countdown_description: countdownDescription,
    operator_name: operatorName,
    operator_title: operatorTitle,
    operator_bio: operatorBio,
    next_action_copy: nextActionCopy,
  });

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidateMission();
  redirect("/admin?message=Mission%20settings%20updated");
}

function revalidateMission() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/timeline");
  revalidatePath("/failure-archive");
}

export async function updatePostAction(formData: FormData) {
  const { supabase } = await assertAdminSession();

  const postId = getString(formData, "postId");
  const originalSlug = getString(formData, "originalSlug");
  const title = getString(formData, "title");
  const content = getString(formData, "content");
  const excerpt = getString(formData, "excerpt") || content.slice(0, 180);
  const dayNumber = Math.max(1, Math.floor(getNumber(formData, "dayNumber", 1)));
  const streakAfterPost = Math.max(0, Math.floor(getNumber(formData, "streakAfterPost", dayNumber)));
  const studyHours = Math.max(0, getNumber(formData, "studyHours", 0));
  const physicsProgress = Math.min(Math.max(getNumber(formData, "physicsProgress", 0), 0), 100);
  const gymComplete = formData.get("gymComplete") === "on";
  const missionDate = getString(formData, "missionDate") || new Date().toISOString().slice(0, 10);
  const status = getString(formData, "status") === "draft" ? "draft" : "published";
  const slug = getString(formData, "slug") || slugify(`day-${String(dayNumber).padStart(3, "0")}-${title}`);
  const tags = getString(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);

  if (!postId || !title || !content) redirect("/admin?error=Post%20id,%20title,%20and%20content%20are%20required");

  const { error } = await supabase
    .from("posts")
    .update({
      day_number: dayNumber,
      slug,
      title,
      excerpt,
      content,
      mission_date: missionDate,
      tags,
      study_hours: studyHours,
      gym_complete: gymComplete,
      physics_progress: physicsProgress,
      streak_after_post: streakAfterPost,
      status,
    })
    .eq("id", postId);

  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidateMission();
  if (originalSlug) revalidatePath(`/posts/${originalSlug}`);
  revalidatePath(`/posts/${slug}`);
  redirect("/admin?message=Post%20updated");
}

export async function deletePostAction(formData: FormData) {
  const { supabase } = await assertAdminSession();
  const postId = getString(formData, "postId");

  if (!postId) redirect("/admin?error=Missing%20post%20id");

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidateMission();
  redirect("/admin?message=Post%20deleted");
}

export async function clearFailuresAction() {
  await assertAdminSession();
  const admin = createAdminClient();
  if (!admin) redirect("/admin?error=Service%20role%20key%20is%20required%20to%20clear%20failures");

  const { error } = await admin.from("failure_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);

  revalidateMission();
  redirect("/admin?message=Failure%20archive%20cleared");
}

export async function resetMissionAction(formData: FormData) {
  await assertAdminSession();
  const confirmation = getString(formData, "confirmation");
  if (confirmation !== "RESET ASCENT") redirect("/admin?error=Type%20RESET%20ASCENT%20to%20confirm");

  const admin = createAdminClient();
  if (!admin) redirect("/admin?error=Service%20role%20key%20is%20required%20for%20mission%20reset");

  const tables = ["comments", "post_media", "posts", "failure_events"];
  for (const table of tables) {
    const { error } = await admin.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) redirect(`/admin?error=${encodeURIComponent(`${table}: ${error.message}`)}`);
  }

  revalidateMission();
  redirect("/admin?message=Mission%20reset%20to%20zero");
}
