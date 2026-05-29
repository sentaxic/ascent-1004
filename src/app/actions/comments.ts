"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";

import { appwriteConfig } from "@/lib/config";
import { appwriteMessage } from "@/lib/appwrite/errors";
import { createAdminClient, createSessionClient } from "@/lib/appwrite/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function createCommentAction(formData: FormData) {
  const admin = createAdminClient();
  if (!admin) redirect("/auth/login?error=Connect%20Appwrite%20to%20enable%20comments");

  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const parentId = String(formData.get("parentId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  const session = await createSessionClient();
  if (!session) redirect(`/auth/login?next=/posts/${slug}`);

  const user = await session.account.get();
  const limited = checkRateLimit(`comment:${user.$id}`, 12, 10 * 60 * 1000);
  if (!limited.ok) redirect(`/posts/${slug}?error=Slow%20down.%20Comment%20rate%20limit%20hit.`);
  if (!body || body.length > 1600) redirect(`/posts/${slug}?error=Comment%20must%20be%201-1600%20characters`);

  try {
    await admin.databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.comments,
      documentId: ID.unique(),
      data: {
        postId,
        parentId,
        authorId: user.$id,
        body,
        createdAt: new Date().toISOString(),
        updatedAt: "",
        reactionsJson: "[]",
        isDeleted: false,
      },
      permissions: [Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))],
    });
  } catch (error) {
    redirect(`/posts/${slug}?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${slug}#comments`);
}
