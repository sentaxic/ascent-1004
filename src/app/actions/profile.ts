"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function uploadProfileFile(file: File, userId: string, type: "avatar" | "banner") {
  const supabase = await createClient();
  if (!supabase || file.size === 0) return null;

  const extension = file.name.split(".").pop() || "png";
  const path = `${userId}/${type}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from("profiles").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("profiles").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login?error=Connect%20Supabase%20to%20edit%20profiles");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

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
    .slice(0, 5);

  let avatarUrl: string | null = null;
  let bannerUrl: string | null = null;

  if (avatar instanceof File && avatar.size > 0) avatarUrl = await uploadProfileFile(avatar, user.id, "avatar");
  if (banner instanceof File && banner.size > 0) bannerUrl = await uploadProfileFile(banner, user.id, "banner");

  const updates: Record<string, unknown> = {
    username,
    display_name: displayName,
    bio,
    social_links: socialLinks,
  };

  if (avatarUrl) updates.avatar_url = avatarUrl;
  if (bannerUrl) updates.banner_url = bannerUrl;

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) redirect(`/profiles/${username}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/profiles/${username}`);
  redirect(`/profiles/${username}`);
}
