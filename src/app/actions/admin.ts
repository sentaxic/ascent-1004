"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Query, Role, type Databases } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { appwriteConfig } from "@/lib/config";
import { appwriteMessage } from "@/lib/appwrite/errors";
import { appwriteFileView, createAdminClient } from "@/lib/appwrite/server";
import { getCurrentProfile } from "@/lib/data";
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
  const admin = createAdminClient();
  if (!admin) redirect("/auth/login?error=Appwrite%20is%20not%20configured");

  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (profile.role !== "admin") redirect("/?error=Admin%20permission%20required");

  return { admin, profile };
}

function revalidateMission() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/timeline");
  revalidatePath("/failure-archive");
  revalidatePath("/sections");
}

async function updateOrCreate(databases: Databases, collectionId: string, documentId: string, data: Record<string, unknown>, permissions?: string[]) {
  try {
    return await databases.updateDocument({ databaseId: appwriteConfig.databaseId, collectionId, documentId, data, permissions });
  } catch {
    return databases.createDocument({ databaseId: appwriteConfig.databaseId, collectionId, documentId, data, permissions });
  }
}

function mediaKindFromType(type: string, url: string) {
  if (type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(url)) return "video";
  if (type === "image/gif" || url.toLowerCase().endsWith(".gif")) return "gif";
  if (type.startsWith("image/") || /\.(png|jpe?g|webp|avif)$/i.test(url)) return "image";
  return "embed";
}

async function uploadManagedPostMedia(file: File, postId: string, index: number) {
  const { admin } = await assertAdminSession();
  const extension = file.name.split(".").pop() || "bin";
  const fileId = ID.unique();

  await admin.storage.createFile({
    bucketId: appwriteConfig.postMediaBucketId,
    fileId,
    file: InputFile.fromBuffer(file, `managed-${Date.now()}-${index}.${extension}`),
    permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))],
  });

  return appwriteFileView(appwriteConfig.postMediaBucketId, fileId);
}

async function uploadSectionBanner(file: File, sectionId: string) {
  const { admin } = await assertAdminSession();
  if (!file.size) return "";
  const extension = file.name.split(".").pop() || "png";
  const fileId = ID.unique();

  await admin.storage.createFile({
    bucketId: appwriteConfig.postMediaBucketId,
    fileId,
    file: InputFile.fromBuffer(file, `section-${sectionId}-${Date.now()}.${extension}`),
    permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))],
  });

  return appwriteFileView(appwriteConfig.postMediaBucketId, fileId);
}

function assertValidDate(value: string, field: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) {
    redirect(`/admin?error=${encodeURIComponent(`${field} must be a valid ISO date/time`)}`);
  }
  return value;
}

export async function updateMissionSettingsAction(formData: FormData) {
  const { admin } = await assertAdminSession();

  const applicationDeadline = assertValidDate(getString(formData, "applicationDeadline"), "MIT deadline");
  const decisionHorizon = assertValidDate(getString(formData, "decisionHorizon"), "Pi Day horizon");
  const missionTimeZone = getString(formData, "missionTimeZone") || "Asia/Kolkata";
  const missedDayCutoffHour = Math.min(Math.max(Math.floor(getNumber(formData, "missedDayCutoffHour", 22)), 0), 23);

  try {
    await updateOrCreate(admin.databases, appwriteConfig.collections.missionSettings, "singleton", {
      applicationDeadline,
      decisionHorizon,
      missionTimeZone,
      missedDayCutoffHour,
      countdownLabel: getString(formData, "countdownLabel"),
      countdownDescription: getString(formData, "countdownDescription"),
      operatorName: getString(formData, "operatorName"),
      operatorTitle: getString(formData, "operatorTitle"),
      operatorBio: getString(formData, "operatorBio"),
      nextActionCopy: getString(formData, "nextActionCopy"),
      failureMessageTemplate: getString(formData, "failureMessageTemplate"),
      instagramWebhookUrl: getString(formData, "instagramWebhookUrl"),
      automationEnabled: formData.get("automationEnabled") === "on",
    }, [Permission.read(Role.any()), Permission.update(Role.label("admin"))]);
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Mission%20settings%20updated");
}

export async function createSectionAction(formData: FormData) {
  const { admin } = await assertAdminSession();
  const name = getString(formData, "name");
  if (!name) redirect("/admin?error=Section%20name%20is%20required");

  const sectionId = ID.unique();
  const slug = slugify(getString(formData, "slug") || name);
  const banner = formData.get("banner");
  let bannerUrl = "";

  try {
    if (banner instanceof File && banner.size > 0) bannerUrl = await uploadSectionBanner(banner, sectionId);

    await admin.databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.sections,
      documentId: sectionId,
      data: {
        name,
        slug,
        description: getString(formData, "description"),
        icon: getString(formData, "icon") || name.slice(0, 1),
        accentColor: getString(formData, "accentColor") || "#ff3b30",
        theme: getString(formData, "theme") || "terminal",
        bannerUrl,
        layout: getString(formData, "layout") || "timeline",
        visibility: getString(formData, "visibility") || "public",
        commentsEnabled: formData.get("commentsEnabled") === "on",
        featured: formData.get("featured") === "on",
        archived: false,
        sortOrder: Math.floor(getNumber(formData, "sortOrder", 50)),
        parentId: getString(formData, "parentId"),
        moderatorIds: getString(formData, "moderatorIds").split(",").map((id) => id.trim()).filter(Boolean),
      },
      permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))],
    });
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Section%20created");
}

export async function updateSectionAction(formData: FormData) {
  const { admin } = await assertAdminSession();
  const sectionId = getString(formData, "sectionId");
  const name = getString(formData, "name");
  if (!sectionId || !name) redirect("/admin?error=Section%20id%20and%20name%20are%20required");

  const banner = formData.get("banner");
  const data: Record<string, unknown> = {
    name,
    slug: slugify(getString(formData, "slug") || name),
    description: getString(formData, "description"),
    icon: getString(formData, "icon") || name.slice(0, 1),
    accentColor: getString(formData, "accentColor") || "#ff3b30",
    theme: getString(formData, "theme") || "terminal",
    layout: getString(formData, "layout") || "timeline",
    visibility: getString(formData, "visibility") || "public",
    commentsEnabled: formData.get("commentsEnabled") === "on",
    featured: formData.get("featured") === "on",
    archived: formData.get("archived") === "on",
    sortOrder: Math.floor(getNumber(formData, "sortOrder", 50)),
    parentId: getString(formData, "parentId"),
    moderatorIds: getString(formData, "moderatorIds").split(",").map((id) => id.trim()).filter(Boolean),
  };

  try {
    if (banner instanceof File && banner.size > 0) data.bannerUrl = await uploadSectionBanner(banner, sectionId);
    await admin.databases.updateDocument({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.sections, documentId: sectionId, data });
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Section%20updated");
}

export async function duplicateSectionAction(formData: FormData) {
  const { admin } = await assertAdminSession();
  const sectionId = getString(formData, "sectionId");
  if (!sectionId) redirect("/admin?error=Missing%20section%20id");

  try {
    const source = await admin.databases.getDocument({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.sections, documentId: sectionId }) as Record<string, unknown>;
    const name = `${String(source.name ?? "Section")} Copy`;
    await admin.databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.sections,
      documentId: ID.unique(),
      data: {
        ...source,
        name,
        slug: slugify(name),
        archived: false,
        sortOrder: Number(source.sortOrder ?? 50) + 1,
      },
      permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))],
    });
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Section%20duplicated");
}

export async function archiveSectionAction(formData: FormData) {
  const { admin } = await assertAdminSession();
  const sectionId = getString(formData, "sectionId");
  if (!sectionId) redirect("/admin?error=Missing%20section%20id");

  try {
    await admin.databases.updateDocument({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.sections, documentId: sectionId, data: { archived: true } });
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Section%20archived");
}

export async function deleteSectionAction(formData: FormData) {
  const { admin } = await assertAdminSession();
  const sectionId = getString(formData, "sectionId");
  const confirmation = getString(formData, "confirmation");
  if (confirmation !== "DELETE SECTION") redirect("/admin?error=Type%20DELETE%20SECTION%20to%20confirm");

  try {
    await admin.databases.deleteDocument({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.sections, documentId: sectionId });
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Section%20deleted");
}

export async function updatePostAction(formData: FormData) {
  const { admin } = await assertAdminSession();

  const postId = getString(formData, "postId");
  const originalSlug = getString(formData, "originalSlug");
  const title = getString(formData, "title");
  const content = getString(formData, "content");
  const dayNumber = Math.max(1, Math.floor(getNumber(formData, "dayNumber", 1)));
  const slug = getString(formData, "slug") || slugify(`day-${String(dayNumber).padStart(3, "0")}-${title}`);

  if (!postId || !title || !content) redirect("/admin?error=Post%20id,%20title,%20and%20content%20are%20required");

  const mediaUrls = getString(formData, "mediaUrls").split("\n").map((url) => url.trim()).filter(Boolean);
  const files = formData.getAll("mediaFiles").filter((file): file is File => file instanceof File && file.size > 0);

  try {
    await admin.databases.updateDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.posts,
      documentId: postId,
      data: {
        sectionId: getString(formData, "sectionId"),
        sectionSlug: getString(formData, "sectionSlug"),
        sectionName: getString(formData, "sectionName"),
        dayNumber,
        slug,
        title,
        excerpt: getString(formData, "excerpt") || content.slice(0, 220),
        content,
        missionDate: getString(formData, "missionDate") || new Date().toISOString().slice(0, 10),
        objective: getString(formData, "objective"),
        failures: getString(formData, "failures"),
        lessons: getString(formData, "lessons"),
        tags: getString(formData, "tags").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 16),
        studyHours: Math.max(0, getNumber(formData, "studyHours", 0)),
        weightKg: Math.max(0, getNumber(formData, "weightKg", 0)),
        codingProgress: Math.min(Math.max(getNumber(formData, "codingProgress", 0), 0), 100),
        physicsProgress: Math.min(Math.max(getNumber(formData, "physicsProgress", 0), 0), 100),
        streakAfterPost: Math.max(0, Math.floor(getNumber(formData, "streakAfterPost", dayNumber))),
        gymComplete: formData.get("gymComplete") === "on",
        status: getString(formData, "status") === "draft" ? "draft" : getString(formData, "status") === "archived" ? "archived" : "published",
        featured: formData.get("featured") === "on",
        pinned: formData.get("pinned") === "on",
      },
    });

    await admin.databases.deleteDocuments({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.postMedia, queries: [Query.equal("postId", postId)] });

    const rows = [];
    for (const [index, url] of mediaUrls.entries()) rows.push({ postId, kind: mediaKindFromType("", url), url, alt: `${title} media ${index + 1}`, width: 0, height: 0, orientation: "landscape", sortOrder: index });
    for (const [index, file] of files.entries()) {
      const url = await uploadManagedPostMedia(file, postId, index);
      rows.push({ postId, kind: mediaKindFromType(file.type, url), url, alt: file.name, width: 0, height: 0, orientation: "landscape", sortOrder: rows.length });
    }

    await Promise.all(rows.map((row) => admin.databases.createDocument({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.postMedia, documentId: ID.unique(), data: row, permissions: [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.delete(Role.label("admin"))] })));
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  if (originalSlug) revalidatePath(`/posts/${originalSlug}`);
  revalidatePath(`/posts/${slug}`);
  redirect("/admin?message=Post%20updated");
}

export async function deletePostAction(formData: FormData) {
  const { admin } = await assertAdminSession();
  const postId = getString(formData, "postId");
  if (!postId) redirect("/admin?error=Missing%20post%20id");

  try {
    await admin.databases.deleteDocument({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.posts, documentId: postId });
    await admin.databases.deleteDocuments({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.postMedia, queries: [Query.equal("postId", postId)] });
    await admin.databases.deleteDocuments({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.comments, queries: [Query.equal("postId", postId)] });
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Post%20deleted");
}

export async function clearFailuresAction() {
  const { admin } = await assertAdminSession();
  try {
    await admin.databases.deleteDocuments({ databaseId: appwriteConfig.databaseId, collectionId: appwriteConfig.collections.failureEvents });
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Failure%20archive%20cleared");
}

export async function resetMissionAction(formData: FormData) {
  const { admin } = await assertAdminSession();
  const confirmation = getString(formData, "confirmation");
  if (confirmation !== "RESET ASCENT") redirect("/admin?error=Type%20RESET%20ASCENT%20to%20confirm");

  try {
    for (const collectionId of [appwriteConfig.collections.comments, appwriteConfig.collections.postMedia, appwriteConfig.collections.posts, appwriteConfig.collections.failureEvents]) {
      await admin.databases.deleteDocuments({ databaseId: appwriteConfig.databaseId, collectionId });
    }
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidateMission();
  redirect("/admin?message=Mission%20reset%20to%20zero");
}
