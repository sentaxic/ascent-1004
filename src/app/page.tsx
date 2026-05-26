export const dynamic = "force-dynamic";

import Link from "next/link";

import { Countdown } from "@/components/home/countdown";
import { LatestPost } from "@/components/home/latest-post";
import { MetricGrid } from "@/components/home/metric-grid";
import { MissionOverview } from "@/components/home/mission-overview";
import { MissionSidebar } from "@/components/home/mission-sidebar";
import { ActionCard } from "@/components/ui/action-card";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardSnapshot } from "@/lib/data";
import { padDay } from "@/lib/utils";

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot();
  const nextDay = snapshot.latestPost ? snapshot.latestPost.dayNumber + 1 : 1;

  return (
    <div className="container-shell space-y-5 py-8 sm:py-12">
      <PageHero
        eyebrow="mission control / ascent-1004"
        title="A public command center for the climb."
        description="Track the MIT arc, study load, gym discipline, physics progress, daily logs, and failures from one calm mission dashboard. Nothing starts inflated: the archive stays at zero until the first real Day 001 is published."
        actions={[
          { href: "/timeline", label: "Read timeline" },
          { href: "/auth/signup", label: "Join observer channel", variant: "secondary" },
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["next log", padDay(nextDay)],
            ["published", snapshot.posts.length.toString().padStart(3, "0")],
            ["system mode", snapshot.posts.length ? "tracking" : "ready"],
          ].map(([label, value]) => (
            <div key={label} className="soft-card rounded-2xl p-4">
              <p className="mono-label">{label}</p>
              <p className="mt-2 text-2xl tracking-[-0.05em] text-ash">{value}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <div className="grid gap-5 lg:grid-cols-12">
        <Countdown settings={snapshot.settings} />
        <MissionSidebar latestPost={snapshot.latestPost} failures={snapshot.failures} settings={snapshot.settings} />
      </div>

      <MetricGrid metrics={snapshot.metrics} />

      <section className="terminal-panel reveal rounded-[2rem] p-5 sm:p-6" style={{ animationDelay: "220ms" }}>
        <SectionHeading
          eyebrow="start here"
          title="How the site works"
          description="A simple public loop: publish, measure, reflect, and keep the receipts visible."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ActionCard index="01/" title="Publish one daily log" body="Only Micheal can publish. Every real post becomes a numbered DAY ### entry with progress, media, and comments." href="/timeline" cta="Timeline" />
          <ActionCard index="02/" title="Watch the dashboard move" body="Streaks, study hours, gym consistency, and physics progress update from post data instead of fake launch numbers." href="/" cta="Live" tone="amber" />
          <ActionCard index="03/" title="Keep failures public" body="If the cutoff passes without a post after the mission starts, the Failure Archive records it for accountability." href="/failure-archive" cta="Archive" tone="red" />
          <ActionCard index="04/" title="Join as an observer" body="Visitors can create a profile, add an avatar/banner, and comment under posts without getting publish access." href="/auth/signup" cta="Join" />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <MissionOverview dailyMetrics={snapshot.dailyMetrics} />
        <LatestPost post={snapshot.latestPost} />
      </div>

      <section className="mission-rail terminal-panel reveal overflow-hidden rounded-[2rem] p-5 sm:p-6" style={{ animationDelay: "320ms" }}>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mono-label text-redline">operator flow</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash sm:text-3xl">One clean loop for every day.</h2>
            <p className="mt-3 text-sm leading-6 text-muted">The whole point is to make posting manageable: write the log, enter the numbers, attach media if needed, then let the public pages update themselves.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["write", "Capture what actually happened."],
              ["measure", "Study, gym, physics, streak."],
              ["ship", "Publish before cutoff."],
            ].map(([title, body], index) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="mono-label text-redline">0{index + 1}</p>
                <h3 className="mt-5 text-lg text-ash">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <Link href="/admin" className="button-secondary mt-5 inline-flex rounded-full px-5 py-3 text-xs uppercase tracking-[0.16em]">
          Open operator console
        </Link>
      </section>
    </div>
  );
}
