"use server";

import { redirect } from "next/navigation";
import { ID, Permission, Role } from "node-appwrite";

import { appUrl, appwriteConfig, hasAppwriteAdminEnv, siteConfig } from "@/lib/config";
import { appwriteMessage } from "@/lib/appwrite/errors";
import { clearSessionCookie, createAdminClient, createSessionClient, setSessionCookie } from "@/lib/appwrite/server";
import { checkRateLimit } from "@/lib/rate-limit";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isAdminEmail(email: string) {
  return Boolean(process.env.APPWRITE_ADMIN_EMAIL && email.toLowerCase() === process.env.APPWRITE_ADMIN_EMAIL.toLowerCase());
}

async function ensureProfile(userId: string, username: string, displayName: string, email: string) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Appwrite admin env is not configured");

  const role = isAdminEmail(email) ? "admin" : "user";
  await admin.databases.createDocument({
    databaseId: appwriteConfig.databaseId,
    collectionId: appwriteConfig.collections.profiles,
    documentId: userId,
    data: {
      username,
      usernameLower: username.toLowerCase(),
      displayName: displayName || username,
      role,
      avatarUrl: "",
      bannerUrl: "",
      bio: "",
      socialLinksJson: "[]",
      badges: role === "admin" ? ["operator", "founder"] : ["observer"],
      streak: 0,
      activityScore: 0,
      status: "online",
    },
    permissions: [Permission.read(Role.any()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))],
  });
}

export async function signUpAction(formData: FormData) {
  if (!hasAppwriteAdminEnv()) redirect("/auth/signup?error=Appwrite%20is%20not%20configured%20yet");

  const username = getString(formData, "username");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const displayName = getString(formData, "displayName") || username;

  const limited = checkRateLimit(`signup:${email.toLowerCase()}`, 5, 60 * 60 * 1000);
  if (!limited.ok) redirect("/auth/signup?error=Too%20many%20signup%20attempts.%20Try%20again%20later.");

  if (!username || !email || password.length < 8) {
    redirect("/auth/signup?error=Use%20a%20username,%20email,%20and%208%2B%20character%20password");
  }

  if (username.toLowerCase() === siteConfig.adminUsername.toLowerCase() && !isAdminEmail(email)) {
    redirect("/auth/signup?error=The%20administrator%20username%20is%20reserved");
  }

  const admin = createAdminClient();
  if (!admin) redirect("/auth/signup?error=Appwrite%20admin%20client%20is%20not%20configured");

  try {
    const user = await admin.account.create({ userId: ID.unique(), email, password, name: displayName });
    await ensureProfile(user.$id, username, displayName, email);
    const session = await admin.account.createEmailPasswordSession({ email, password });
    await setSessionCookie(session.secret, session.expire);

    const sessionClient = await createSessionClient();
    await sessionClient?.account.createEmailVerification({ url: appUrl("/auth/verify") });
  } catch (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  redirect("/auth/verify?message=Account%20created.%20Check%20your%20email%20to%20verify%20this%20device.");
}

export async function signInAction(formData: FormData) {
  if (!hasAppwriteAdminEnv()) redirect("/auth/login?error=Appwrite%20is%20not%20configured%20yet");

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const limited = checkRateLimit(`login:${email.toLowerCase()}`, 10, 60 * 60 * 1000);

  if (!limited.ok) redirect("/auth/login?error=Too%20many%20login%20attempts.%20Try%20again%20later.");

  const admin = createAdminClient();
  if (!admin) redirect("/auth/login?error=Appwrite%20admin%20client%20is%20not%20configured");

  let needsVerification = false;
  try {
    const session = await admin.account.createEmailPasswordSession({ email, password });
    await setSessionCookie(session.secret, session.expire);
    const sessionClient = await createSessionClient();
    const user = await sessionClient?.account.get();
    needsVerification = Boolean(user && !user.emailVerification);
  } catch (error) {
    redirect(`/auth/login?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  if (needsVerification) redirect("/auth/verify?message=Logged%20in.%20Please%20verify%20your%20email%20to%20unlock%20all%20features.");
  redirect("/");
}

export async function resendVerificationAction() {
  const session = await createSessionClient();
  if (!session) redirect("/auth/login?error=Log%20in%20to%20resend%20verification");

  const limited = checkRateLimit("verify:resend", 3, 60 * 60 * 1000);
  if (!limited.ok) redirect("/auth/verify?error=Too%20many%20verification%20emails.%20Try%20again%20later.");

  try {
    await session.account.createEmailVerification({ url: appUrl("/auth/verify") });
  } catch (error) {
    redirect(`/auth/verify?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  redirect("/auth/verify?message=Verification%20email%20sent.%20Use%20the%20latest%20link.");
}

export async function verifyEmailAction(formData: FormData) {
  const userId = getString(formData, "userId");
  const secret = getString(formData, "secret");
  const admin = createAdminClient();

  if (!admin) redirect("/auth/verify?error=Appwrite%20is%20not%20configured");
  if (!userId || !secret) redirect("/auth/verify?error=Missing%20verification%20token");

  try {
    await admin.account.updateEmailVerification({ userId, secret });
  } catch (error) {
    redirect(`/auth/verify?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  redirect("/?message=Email%20verified.%20Mission%20channel%20unlocked.");
}

export async function requestRecoveryAction(formData: FormData) {
  const email = getString(formData, "email");
  const admin = createAdminClient();

  if (!admin) redirect("/auth/recover?error=Appwrite%20is%20not%20configured");
  if (!email) redirect("/auth/recover?error=Email%20is%20required");

  const limited = checkRateLimit(`recover:${email.toLowerCase()}`, 3, 60 * 60 * 1000);
  if (!limited.ok) redirect("/auth/recover?error=Too%20many%20recovery%20emails.%20Try%20again%20later.");

  try {
    await admin.account.createRecovery({ email, url: appUrl("/auth/reset") });
  } catch (error) {
    redirect(`/auth/recover?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  redirect("/auth/recover?message=Recovery%20email%20sent.%20Use%20the%20latest%20link.");
}

export async function resetPasswordAction(formData: FormData) {
  const userId = getString(formData, "userId");
  const secret = getString(formData, "secret");
  const password = getString(formData, "password");
  const admin = createAdminClient();

  if (!admin) redirect("/auth/reset?error=Appwrite%20is%20not%20configured");
  if (!userId || !secret || password.length < 8) redirect("/auth/reset?error=Use%20the%20email%20link%20and%20an%208%2B%20character%20password");

  try {
    await admin.account.updateRecovery({ userId, secret, password });
  } catch (error) {
    redirect(`/auth/reset?error=${encodeURIComponent(appwriteMessage(error))}`);
  }

  redirect("/auth/login?message=Password%20updated.%20Log%20in%20with%20the%20new%20password.");
}

export async function signOutAction() {
  const session = await createSessionClient();
  try {
    await session?.account.deleteSession({ sessionId: "current" });
  } catch {
    // Clearing the local cookie is enough if the remote session already expired.
  }
  await clearSessionCookie();
  redirect("/");
}
