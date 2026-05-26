import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { siteConfig } from "@/lib/config";
import type { Profile } from "@/lib/types";

const publicLinks = [
  ["Home", "/"],
  ["Timeline", "/timeline"],
  ["Failures", "/failure-archive"],
];

export function Nav({ profile }: { profile: Profile | null }) {
  const links = profile?.role === "admin" ? [...publicLinks, ["Console", "/admin"]] : publicLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-void/80 backdrop-blur-xl">
      <div className="container-shell flex min-h-16 items-center justify-between gap-4 py-3">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-redline/50 bg-redline/10 text-xs text-redline shadow-[0_0_24px_rgba(255,59,48,0.18)] transition group-hover:scale-105">A</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-[0.18em] text-ash">{siteConfig.name}</span>
            <span className="hidden text-[0.62rem] uppercase tracking-[0.2em] text-muted sm:block">Public mission control</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="glow-link rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-ash">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {profile ? (
            <>
              <Link href={`/profiles/${profile.username}`} className="button-secondary rounded-full px-3 py-2 text-xs text-ash">
                @{profile.username}
              </Link>
              <form action={signOutAction}>
                <button className="hidden rounded-full border border-white/10 px-3 py-2 text-xs text-muted transition hover:border-redline/50 hover:text-ash sm:block">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/signup" className="hidden rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted transition hover:border-redline/50 hover:text-ash sm:inline-flex">
                Join
              </Link>
              <Link href="/auth/login" className="button-primary rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className="container-shell flex gap-2 overflow-x-auto pb-3 lg:hidden" aria-label="Mobile navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="glow-link shrink-0 rounded-full px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em] text-muted hover:text-ash">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
