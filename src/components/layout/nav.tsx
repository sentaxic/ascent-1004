import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { siteConfig } from "@/lib/config";
import type { Profile } from "@/lib/types";

const links = [
  ["Timeline", "/timeline"],
  ["Failures", "/failure-archive"],
  ["Admin", "/admin"],
];

export function Nav({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-void/75 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-redline/50 bg-redline/10 text-xs text-redline shadow-[0_0_24px_rgba(255,59,48,0.18)]">A</span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.18em] text-ash">{siteConfig.name}</span>
            <span className="hidden text-[0.62rem] uppercase tracking-[0.2em] text-muted sm:block">Mission archive online</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="glow-link rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-ash">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <Link href={`/profiles/${profile.username}`} className="glow-link rounded-full px-3 py-2 text-xs text-ash">
                @{profile.username}
              </Link>
              <form action={signOutAction}>
                <button className="hidden rounded-full border border-white/10 px-3 py-2 text-xs text-muted transition hover:border-redline/50 hover:text-ash sm:block">Sign out</button>
              </form>
            </>
          ) : (
            <Link href="/auth/login" className="button-primary rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
