import Link from "next/link";

import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="container-shell pb-8 pt-4">
      <div className="terminal-panel rounded-[1.75rem] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <div>
            <p className="font-semibold tracking-[0.16em] text-ash">{siteConfig.name}</p>
            <p className="mt-1">Public discipline archive, physics log, and MIT mission tracker.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/timeline" className="glow-link rounded-full px-3 py-2">Timeline</Link>
            <Link href="/failure-archive" className="glow-link rounded-full px-3 py-2">Failures</Link>
            <Link href="/auth/signup" className="glow-link rounded-full px-3 py-2">Join</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
