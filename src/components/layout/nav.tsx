import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { siteConfig } from "@/lib/config";
import type { Profile } from "@/lib/types";

const publicLinks: Array<[string, string]> = [
  ["Home", "/"],
  ["Timeline", "/timeline"],
  ["Failures", "/failure-archive"],
];

export function Nav({ profile }: { profile: Profile | null }) {
  const links: Array<[string, string]> = profile?.role === "admin" ? [...publicLinks, ["Console", "/admin"]] : publicLinks;

  return (
    <header className="fixed inset-x-0 top-3 z-[45] px-3 sm:top-4 sm:px-4">
      <div className="container-shell glass glass-accent-border flex items-center justify-between gap-4 rounded-2xl px-3 py-2.5 sm:px-4">
        <Link href="/" className="group flex min-w-0 items-center gap-3" data-cursor="active">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-accent-line bg-accent-soft text-xs text-accent shadow-glow transition group-hover:scale-105">
            A
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-[0.18em] text-ash">{siteConfig.name}</span>
            <span className="hidden text-[0.6rem] uppercase tracking-[0.24em] text-muted sm:block">Mission control</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              data-cursor="active"
              className="rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ash"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {profile ? (
            <>
              <Link href={`/profiles/${profile.username}`} data-cursor="active" className="button-secondary rounded-full px-3 py-2 text-xs text-ash">
                @{profile.username}
              </Link>
              <form action={signOutAction}>
                <button data-cursor="active" className="hidden rounded-full border border-white/10 px-3 py-2 text-xs text-muted transition hover:border-accent-line hover:text-ash sm:block">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/signup" data-cursor="active" className="hidden rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ash sm:inline-flex">
                Join
              </Link>
              <Link href="/auth/login" data-cursor="active" className="button-primary rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em]">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="container-shell mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Mobile navigation">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="glass shrink-0 rounded-full px-4 py-1.5 text-[0.64rem] uppercase tracking-[0.2em] text-muted"
          >
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}
