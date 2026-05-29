"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { appwriteConfig } from "@/lib/config";
import { appwriteMessage } from "@/lib/appwrite/errors";
import { appwriteFilePreview, createAdminClient, createSessionClient } from "@/lib/appwrite/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function currentUserId() {
  const session = await createSessionClient();
  if (!session) return null;
  const user = await session.account.get();
  return user.$id;
}

async function uploadProfileFile(file: File, userId: string, type: "avatar" | "banner") {
  const admin = createAdminClient();
  if (!admin || file.size === 0) return null;

  const extension = file.name.split(".").pop() || "png";
  const fileId = ID.unique();
  await admin.storage.createFile({
    bucketId: appwriteConfig.profileBucketId,
    fileId,
    file: InputFile.fromBuffer(file, `${type}-${Date.now()}.${extension}`),
    permissions: [Permission.read(Role.any()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))],
  });

  return appwriteFilePreview(appwriteConfig.profileBucketId, fileId, type === "avatar" ? 512 : 1800);
}

export async function updateProfileAction(formData: FormData) {
  const admin = createAdminClient();
  if (!admin) redirect("/auth/login?error=Connect%20Appwrite%20to%20edit%20profiles");

  const userId = await currentUserId();
  if (!userId) redirect("/auth/login");

  const username = getString(formData, "username");
  const displayName = getString(formData, "displayName") || username;
  const bio = getString(formData, "bio");
  const socialRaw = getString(formData, "socialLinks");
  const avatar = formData.get("avatar");
  const banner = formData.get("banner");

  const socialLinks = socialRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...urlParts] = line.split("|");
      return { label: label.trim(), url: urlParts.join("|").trim() };
    })
    .filter((link) => link.label && link.url)
    .slice(0, 8);

  let avatarUrl: string | null = null;
  let bannerUrl: string | null = null;

  try {
    if (avatar instanceof File && avatar.size > 0) avatarUrl = await uploadProfileFile(avatar, userId, "avatar");
    if (banner instanceof File && banner.size > 0) bannerUrl = await uploadProfileFile(banner, userId, "banner");

    const updates: Record<string, unknown> = {
      username,
      usernameLower: username.toLowerCase(),
      displayName,
      bio,
      socialLinksJson: JSON.stringify(socialLinks),
      status: "online",
    };

    if (avatarUrl) updates.avatarUrl = avatarUrl;
    if (bannerUrl) updates.bannerUrl = bannerUrl;

    await admin.databases.updateDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.profiles,
      documentId: userId,
      data: updates,
    });
  } catch (error) {
    redirect(`/profiles/${username || userId}?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidatePath(`/profiles/${username}`);
  redirect(`/profiles/${username}`);
}
