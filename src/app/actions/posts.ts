"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

async function assertAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login?error=Connect%20Supabase%20to%20publish");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/?error=Admin%20permission%20required");

  return { supabase, user };
}

async function uploadPostMedia(file: File, postId: string, index: number) {
  const { supabase } = await assertAdmin();
  const extension = file.name.split(".").pop() || "bin";
  const path = `${postId}/${Date.now()}-${index}.${extension}`;

  const { error } = await supabase.storage.from("post-media").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("post-media").getPublicUrl(path);
  return data.publicUrl;
}

function mediaKindFromType(type: string, url: string) {
  if (type.startsWith("video/")) return "video";
  if (type === "image/gif" || url.toLowerCase().endsWith(".gif")) return "gif";
  if (type.startsWith("image/")) return "image";
  return "embed";
}

export async function createPostAction(formData: FormData) {
  const { supabase, user } = await assertAdmin();

  const title = getString(formData, "title");
  const content = getString(formData, "content");
  const excerpt = getString(formData, "excerpt") || content.slice(0, 180);
  const tags = getString(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 10);
  const studyHours = getNumber(formData, "studyHours");
  const physicsProgress = getNumber(formData, "physicsProgress");
  const gymComplete = formData.get("gymComplete") === "on";
  const missionDate = getString(formData, "missionDate") || new Date().toISOString().slice(0, 10);

  if (!title || !content) redirect("/admin?error=Title%20and%20content%20are%20required");

  const { data: latestPost } = await supabase
    .from("posts")
    .select("day_number, streak_after_post")
    .order("day_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextDay = Number(latestPost?.day_number ?? 0) + 1;
  const slug = `${slugify(`day-${String(nextDay).padStart(3, "0")}-${title}`)}`;
  const streakAfterPost = Number(latestPost?.streak_after_post ?? 0) + 1;

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      day_number: nextDay,
      slug,
      title,
      excerpt,
      content,
      published_at: new Date().toISOString(),
      mission_date: missionDate,
      tags,
      study_hours: studyHours,
      gym_complete: gymComplete,
      physics_progress: physicsProgress,
      streak_after_post: streakAfterPost,
      status: "published",
    })
    .select("id")
    .single();

  if (error || !post) redirect(`/admin?error=${encodeURIComponent(error?.message ?? "Post failed")}`);

  const mediaUrls = getString(formData, "mediaUrls")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
  const files = formData.getAll("mediaFiles").filter((file): file is File => file instanceof File && file.size > 0);
  const mediaRows = [];

  for (const [index, url] of mediaUrls.entries()) {
    mediaRows.push({
      post_id: post.id,
      kind: mediaKindFromType("", url),
      url,
      alt: `${title} media ${index + 1}`,
      sort_order: index,
    });
  }

  for (const [index, file] of files.entries()) {
    const url = await uploadPostMedia(file, post.id, index);
    mediaRows.push({
      post_id: post.id,
      kind: mediaKindFromType(file.type, url),
      url,
      alt: file.name,
      sort_order: mediaRows.length,
    });
  }

  if (mediaRows.length) await supabase.from("post_media").insert(mediaRows);

  revalidatePath("/");
  revalidatePath("/timeline");
  redirect(`/posts/${slug}`);
}
