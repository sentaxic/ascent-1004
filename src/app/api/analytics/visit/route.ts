import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const { error } = await supabase.from("visitor_events").insert({
    path,
    referrer,
    user_agent: userAgent,
    ip_hash: ip,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
