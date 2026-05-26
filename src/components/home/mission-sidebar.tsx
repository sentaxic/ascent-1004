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
          <p className="mono-label">operator profile</p>
          <StatusDot status="stable" />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-2xl border border-redline/35 bg-redline/10 text-2xl text-redline shadow-[0_0_40px_rgba(255,59,48,0.12)]">M</div>
          <div>
            <p className="text-xl text-ash">{settings.operatorName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{settings.operatorTitle}</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">{settings.operatorBio}</p>
        <Link href="/profiles/Micheal" className="button-secondary mt-5 inline-flex rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]">
          View profile
        </Link>
      </section>

      <section className="terminal-panel reveal rounded-[2rem] p-5" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center justify-between gap-3">
          <p className="mono-label text-redline">accountability monitor</p>
          <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-muted">cutoff {settings.missedDayCutoffHour}:00</span>
        </div>
        {latestFailure ? (
          <div className="mt-4 rounded-2xl border border-redline/25 bg-redline/[0.055] p-4">
            <p className="text-sm text-ash">{padDay(latestFailure.dayNumber)} / {latestFailure.failureDate}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{latestFailure.reason}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-green-400/20 bg-green-400/[0.035] p-4">
            <p className="text-sm text-ash">No failures archived.</p>
            <p className="mt-2 text-xs leading-5 text-muted">The record is clean. Once Day 001 exists, missed days will be logged here automatically.</p>
          </div>
        )}
        <Link href="/failure-archive" className="mt-4 inline-flex text-xs uppercase tracking-[0.16em] text-redline">Open archive</Link>
      </section>

      <section className="terminal-panel reveal rounded-[2rem] p-5" style={{ animationDelay: "300ms" }}>
        <p className="mono-label">next action</p>
        <p className="mt-4 text-sm leading-6 text-muted">{settings.nextActionCopy.replace("{day}", padDay(nextDay))}</p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
          <p className="mono-label">up next</p>
          <p className="mt-2 text-2xl tracking-[-0.05em] text-ash">{padDay(nextDay)}</p>
        </div>
      </section>
    </aside>
  );
}
