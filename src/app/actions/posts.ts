"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Query, Role, type Models } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { appwriteConfig } from "@/lib/config";
import { appwriteMessage } from "@/lib/appwrite/errors";
import { appwriteFileView, createAdminClient } from "@/lib/appwrite/server";
import { getCurrentProfile, getSections } from "@/lib/data";
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
  const admin = createAdminClient();
  if (!admin) redirect("/auth/login?error=Connect%20Appwrite%20to%20publish");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (profile.role !== "admin") redirect("/?error=Admin%20permission%20required");

  return { admin, profile };
}

function mediaKindFromType(type: string, url: string) {
  if (type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(url)) return "video";
  if (type === "image/gif" || url.toLowerCase().endsWith(".gif")) return "gif";
  if (type.startsWith("image/") || /\.(png|jpe?g|webp|avif)$/i.test(url)) return "image";
  return "embed";
}

async function uploadPostMedia(file: File, postId: string, index: number) {
  const { admin } = await assertAdmin();
  const extension = file.name.split(".").pop() || "bin";
  const fileId = ID.unique();

  await admin.storage.createFile({
    bucketId: appwriteConfig.postMediaBucketId,
    fileId,
    file: InputFile.fromBuffer(file, `${Date.now()}-${index}.${extension}`),
    permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))],
  });

  return appwriteFileView(appwriteConfig.postMediaBucketId, fileId);
}

export async function createPostAction(formData: FormData) {
  const { admin, profile } = await assertAdmin();

  const title = getString(formData, "title");
  const content = getString(formData, "content");
  const excerpt = getString(formData, "excerpt") || content.slice(0, 220);
  const objective = getString(formData, "objective");
  const failures = getString(formData, "failures");
  const lessons = getString(formData, "lessons");
  const tags = getString(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 16);
  const studyHours = getNumber(formData, "studyHours");
  const weightKg = getNumber(formData, "weightKg");
  const codingProgress = Math.min(Math.max(getNumber(formData, "codingProgress"), 0), 100);
  const physicsProgress = Math.min(Math.max(getNumber(formData, "physicsProgress"), 0), 100);
  const gymComplete = formData.get("gymComplete") === "on";
  const pinned = formData.get("pinned") === "on";
  const featured = formData.get("featured") === "on";
  const missionDate = getString(formData, "missionDate") || new Date().toISOString().slice(0, 10);

  if (!title || !content) redirect("/admin?error=Title%20and%20content%20are%20required");

  const sections = await getSections(true);
  const requestedSection = getString(formData, "sectionId") || "mission-log";
  const section = sections.find((item) => item.id === requestedSection || item.slug === requestedSection) ?? sections[0];

  const latest = await admin.databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.collections.posts,
    queries: [Query.orderDesc("dayNumber"), Query.limit(1)],
  }).catch(() => ({ documents: [] as Models.Document[] }));

  const latestPost = latest.documents[0] as (Models.Document & { dayNumber?: number; streakAfterPost?: number }) | undefined;
  const nextDay = Number(latestPost?.dayNumber ?? 0) + 1;
  const slug = slugify(`day-${String(nextDay).padStart(3, "0")}-${title}`);
  const streakAfterPost = Number(latestPost?.streakAfterPost ?? 0) + 1;
  const postId = ID.unique();

  try {
    await admin.databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.posts,
      documentId: postId,
      data: {
        authorId: profile.id,
        sectionId: section.id,
        sectionSlug: section.slug,
        sectionName: section.name,
        dayNumber: nextDay,
        slug,
        title,
        excerpt,
        content,
        publishedAt: new Date().toISOString(),
        missionDate,
        status: "published",
        objective,
        failures,
        lessons,
        tags,
        studyHours,
        weightKg,
        codingProgress,
        gymComplete,
        physicsProgress,
        streakAfterPost,
        featured,
        pinned,
      },
      permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))],
    });

    const mediaUrls = getString(formData, "mediaUrls").split("\n").map((url) => url.trim()).filter(Boolean);
    const files = formData.getAll("mediaFiles").filter((file): file is File => file instanceof File && file.size > 0);
    const mediaRows = [];

    for (const [index, url] of mediaUrls.entries()) {
      mediaRows.push({ postId, kind: mediaKindFromType("", url), url, alt: `${title} media ${index + 1}`, width: 0, height: 0, orientation: "landscape", sortOrder: index });
    }

    for (const [index, file] of files.entries()) {
      const url = await uploadPostMedia(file, postId, index);
      mediaRows.push({ postId, kind: mediaKindFromType(file.type, url), url, alt: file.name, width: 0, height: 0, orientation: "landscape", sortOrder: mediaRows.length });
    }

    await Promise.all(mediaRows.map((row) => admin.databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.postMedia,
      documentId: ID.unique(),
      data: row,
      permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))],
    })));
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error, "Post failed"))}`);
  }

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath(`/sections/${section.slug}`);
  redirect(`/posts/${slug}`);
}
