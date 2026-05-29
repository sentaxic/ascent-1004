import { cookies } from "next/headers";
import { Account, Client, Databases, Storage, Users } from "node-appwrite";

import { appwriteConfig, appwriteSessionCookieName, hasAppwriteAdminEnv, hasAppwriteEnv } from "@/lib/config";

function baseClient() {
  return new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);
}

export function createAdminClient() {
  if (!hasAppwriteAdminEnv()) return null;

  const client = baseClient().setKey(appwriteConfig.apiKey);
  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

export async function createSessionClient() {
  if (!hasAppwriteEnv()) return null;

  const cookieStore = await cookies();
  const session = cookieStore.get(appwriteSessionCookieName())?.value;
  if (!session) return null;

  const client = baseClient().setSession(session);
  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

export async function getSessionSecret() {
  if (!hasAppwriteEnv()) return null;
  const cookieStore = await cookies();
  return cookieStore.get(appwriteSessionCookieName())?.value ?? null;
}

export async function setSessionCookie(secret: string, expire?: string) {
  const cookieStore = await cookies();
  cookieStore.set(appwriteSessionCookieName(), secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    expires: expire ? new Date(expire) : undefined,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(appwriteSessionCookieName());
}

export function appwriteFileView(bucketId: string, fileId: string) {
  const endpoint = appwriteConfig.endpoint.replace(/\/$/, "");
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

export function appwriteFilePreview(bucketId: string, fileId: string, width = 1600) {
  const endpoint = appwriteConfig.endpoint.replace(/\/$/, "");
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${appwriteConfig.projectId}&width=${width}&quality=92`;
}
