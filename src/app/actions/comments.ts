"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function createCommentAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login?error=Connect%20Supabase%20to%20enable%20comments");

  const postId = String(formData.get("postId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth/login?next=/posts/${slug}`);
  if (!body || body.length > 1200) redirect(`/posts/${slug}?error=Comment%20must%20be%201-1200%20characters`);

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    body,
  });

  if (error) redirect(`/posts/${slug}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/posts/${slug}`);
  redirect(`/posts/${slug}#comments`);
}
