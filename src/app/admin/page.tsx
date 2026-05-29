export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { CreatePostForm } from "@/components/admin/create-post-form";
import { MissionSettingsForm } from "@/components/admin/mission-settings-form";
import { PostManager } from "@/components/admin/post-manager";
import { ActionCard } from "@/components/ui/action-card";
import { AnalyticsChart } from "@/components/ui/mini-chart";
import { PageHero } from "@/components/ui/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { hasAppwriteAdminEnv } from "@/lib/config";
import { getCurrentProfile, getDashboardSnapshot, getPosts } from "@/lib/data";
import { padDay } from "@/lib/utils";

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [params, profile, snapshot, allPosts] = await Promise.all([searchParams, getCurrentProfile(), getDashboardSnapshot(), getPosts()]);

  if (hasAppwriteAdminEnv() && profile?.role !== "admin") notFound();

  const nextDay = snapshot.latestPost ? snapshot.latestPost.dayNumber + 1 : 1;

  return (
    <div className="container-shell space-y-5 py-10 sm:py-14">
      <PageHero
        eyebrow="admin dashboard / operator console"
        title="Manage the whole mission without digging through code."
        description="Edit the timer, publish logs, manage media, reset bad test data, monitor analytics, and keep the public archive readable from one place."
        actions={[
          { href: "#publish", label: `Publish ${padDay(nextDay)}` },
          { href: "#settings", label: "Edit site settings", variant: "secondary" },
        ]}
      >
        {!hasAppwriteAdminEnv() ? <span className="rounded-full border border-amber/35 bg-amber/10 px-4 py-2 text-xs text-amber">Demo mode: connect Appwrite to enforce auth</span> : null}
      </PageHero>

      {params.error ? <p className="rounded-2xl border border-redline/35 bg-redline/[0.08] p-4 text-sm text-redline">{params.error}</p> : null}
      {params.message ? <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-ash">{params.message}</p> : null}

      <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
        <SectionHeading eyebrow="quick actions" title="The daily control loop" description="These are the pieces you will touch most often." />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ActionCard index="01/" title="Publish today" body={`Create the next official entry as ${padDay(nextDay)} with study, gym, physics, tags, and media.`} href="#publish" cta="Go" tone="red" />
          <ActionCard index="02/" title="Change the timer" body="Update deadline, Pi Day horizon, timezone, cutoff hour, and homepage copy anytime." href="#settings" cta="Edit" />
          <ActionCard index="03/" title="Fix or reset data" body="Edit posts, replace media URLs, clear failure records, or reset the mission back to zero." href="#manage" cta="Manage" tone="amber" />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-4">
        {[
          ["Visitors", snapshot.visitorCount.toLocaleString(), "public beacon count"],
          ["Engagement", `${snapshot.engagementRate}%`, "comments vs visits"],
          ["Published logs", allPosts.length.toString(), "real archive entries"],
          ["Failures", snapshot.failures.length.toString(), "missed-day records"],
        ].map(([label, value, note]) => (
          <section key={label} className="terminal-panel rounded-[1.5rem] p-5">
            <p className="mono-label">{label}</p>
            <p className="mt-4 text-3xl tracking-[-0.06em] text-ash">{value}</p>
            <p className="mt-2 text-xs text-muted">{note}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
          <SectionHeading eyebrow="analytics" title="Visitor Signal" description="Lightweight engagement telemetry for the mission dashboard." />
          <div className="mt-6">
            <AnalyticsChart data={snapshot.analytics} />
          </div>
        </section>
        <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
          <SectionHeading eyebrow="automation" title="Missed-Day Cron" description="Daily accountability check on Vercel Hobby." />
          <div className="mt-5 space-y-3 text-sm leading-6 text-muted">
            <p>Endpoint: <span className="text-ash">/api/cron/missed-day</span></p>
            <p>Schedule: <span className="text-ash">daily at 22:00 Asia/Kolkata</span>. If no log exists after the mission starts, it records a public failure.</p>
            <p className="text-redline">Instagram text-only posting is not supported by Graph API; use a public failure image URL or webhook target.</p>
          </div>
        </section>
      </div>

      {hasAppwriteAdminEnv() ? (
        <div id="settings" className="scroll-mt-28">
          <MissionSettingsForm settings={snapshot.settings} />
        </div>
      ) : null}

      <div id="publish" className="scroll-mt-28">
        {hasAppwriteAdminEnv() ? <CreatePostForm nextDay={nextDay} /> : (
          <section className="terminal-panel rounded-[2rem] p-6 text-sm leading-6 text-muted">
            Connect Appwrite env vars to unlock real admin publishing. The form is intentionally hidden in demo mode so fake posts do not imply persistence.
          </section>
        )}
      </div>

      {hasAppwriteAdminEnv() ? (
        <div id="manage" className="scroll-mt-28">
          <PostManager posts={allPosts} failures={snapshot.failures} />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href="/" className="button-secondary rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]">View public home</Link>
        <Link href="/timeline" className="button-secondary rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]">View timeline</Link>
      </div>
    </div>
  );
}
