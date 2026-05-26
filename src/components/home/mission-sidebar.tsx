import Link from "next/link";

import { StatusDot } from "@/components/ui/status-dot";
import type { FailureEvent, MissionSettings, Post } from "@/lib/types";
import { padDay } from "@/lib/utils";

export function MissionSidebar({ latestPost, failures, settings }: { latestPost: Post | null; failures: FailureEvent[]; settings: MissionSettings }) {
  const latestFailure = failures[0];
  const nextDay = latestPost ? latestPost.dayNumber + 1 : 1;

  return (
    <aside className="grid gap-4 lg:col-span-4">
      <section className="terminal-panel reveal rounded-[2rem] p-5" style={{ animationDelay: "180ms" }}>
        <div className="flex items-center justify-between">
          <p className="mono-label">operator</p>
          <StatusDot status="stable" />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl border border-redline/35 bg-redline/10 text-2xl text-redline">M</div>
          <div>
            <p className="text-xl text-ash">{settings.operatorName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{settings.operatorTitle}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">{settings.operatorBio}</p>
      </section>
      <section className="terminal-panel reveal rounded-[2rem] p-5" style={{ animationDelay: "240ms" }}>
        <p className="mono-label text-redline">failure monitor</p>
        {latestFailure ? (
          <div className="mt-4 rounded-2xl border border-redline/25 bg-redline/[0.055] p-4">
            <p className="text-sm text-ash">{padDay(latestFailure.dayNumber)} / {latestFailure.failureDate}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{latestFailure.reason}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No failures archived yet. Suspiciously clean. The dashboard is watching.</p>
        )}
        <Link href="/failure-archive" className="mt-4 inline-flex text-xs uppercase tracking-[0.16em] text-redline">Open archive</Link>
      </section>
      <section className="terminal-panel reveal rounded-[2rem] p-5" style={{ animationDelay: "300ms" }}>
        <p className="mono-label">next action</p>
        <p className="mt-4 text-sm leading-6 text-muted">{settings.nextActionCopy.replace("{day}", padDay(nextDay))}</p>
      </section>
    </aside>
  );
}
