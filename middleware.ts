import { NextResponse, type NextRequest } from "next/server";

// Appwrite sessions live in an httpOnly cookie (`a_session_<projectId>`) written
// by the server actions in src/app/actions/auth.ts and validated per-request
// inside server components/actions via createSessionClient(). There is no token
// to refresh here, so middleware simply passes requests through. This stays as
// the home for any future route-level gating.
export function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
