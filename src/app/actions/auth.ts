"use server";

import { redirect } from "next/navigation";

import { siteConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/signup?error=Supabase%20is%20not%20configured%20yet");

  const username = getString(formData, "username");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const displayName = getString(formData, "displayName") || username;

  if (!username || !email || password.length < 8) {
    redirect("/auth/signup?error=Use%20a%20username,%20email,%20and%208%2B%20character%20password");
  }

  if (username.toLowerCase() === siteConfig.adminUsername.toLowerCase()) {
    redirect("/auth/signup?error=The%20administrator%20username%20is%20reserved");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
      },
    },
  });

  if (error) redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/login?message=Account%20created.%20Confirm%20email%20if%20required,%20then%20log%20in.");
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login?error=Supabase%20is%20not%20configured%20yet");

  const email = getString(formData, "email");
  const password = getString(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);

  redirect("/");
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
