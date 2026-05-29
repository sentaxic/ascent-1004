import { NextResponse, type NextRequest } from "next/server";
import { ID, Permission, Role } from "node-appwrite";

import { appwriteConfig } from "@/lib/config";
import { createAdminClient } from "@/lib/appwrite/server";

export async function POST(request: NextRequest) {
  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  try {
    await admin.databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.collections.visitorEvents,
      documentId: ID.unique(),
      data: {
        path,
        referrer,
        userAgent,
        ipHash: ip,
        createdAt: new Date().toISOString(),
      },
      // Telemetry is private: only the admin label can read these documents.
      permissions: [Permission.read(Role.label("admin"))],
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to record visit" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
