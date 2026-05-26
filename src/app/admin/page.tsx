export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { CreatePostForm } from "@/components/admin/create-post-form";
import { MissionSettingsForm } from "@/components/admin/mission-settings-form";
import { PostManager } from "@/components/admin/post-manager";
import { AnalyticsChart } from "@/components/ui/mini-chart";
import { hasSupabaseEnv } from "@/lib/config";
import { getCurrentProfile, getDashboardSnapshot } from "@/lib/data";

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [params, profile, snapshot] = await Promise.all([searchParams, getCurrentProfile(), getDashboardSnapshot()]);

  if (hasSupabaseEnv() && profile?.role !== "admin") notFound();

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-redline">admin dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.07em] text-ash sm:text-6xl">Control Room</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">Analytics, publishing, moderation hooks, uploads, streak data, and automation status live here.</p>
        </div>
        {!hasSupabaseEnv() ? <span className="rounded-full border border-amber/35 bg-amber/10 px-4 py-2 text-xs text-amber">Demo mode: connect Supabase to enforce auth</span> : null}
      </div>

      {params.error ? <p className="mb-5 rounded-2xl border border-redline/35 bg-redline/[0.08] p-4 text-sm text-redline">{params.error}</p> : null}
      {params.message ? <p className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-ash">{params.message}</p> : null}

      <div className="grid gap-5 lg:grid-cols-4">
        {[
          ["Visitors", snapshot.visitorCount.toLocaleString()],
          ["Engagement", `${snapshot.engagementRate}%`],
          ["Published logs", snapshot.posts.length.toString()],
          ["Failures", snapshot.failures.length.toString()],
        ].map(([label, value]) => (
          <section key={label} className="terminal-panel rounded-[1.5rem] p-5">
            <p className="mono-label">{label}</p>
            <p className="mt-4 text-3xl tracking-[-0.06em] text-ash">{value}</p>
          </section>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
          <p className="mono-label text-redline">analytics</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Visitor Signal</h2>
          <div className="mt-6">
            <AnalyticsChart data={snapshot.analytics} />
          </div>
        </section>
        <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
          <p className="mono-label text-redline">automation</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Missed-Day Cron</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-muted">
            <p>Endpoint: <span className="text-ash">/api/cron/missed-day</span></p>
            <p>Vercel can call this after the daily cutoff. If no log exists for the mission date, it records a failure and triggers Instagram via webhook or Graph API media publishing.</p>
            <p className="text-redline">Instagram text-only posting is not supported by Graph API; configure a public failure image URL or webhook target.</p>
          </div>
        </section>
      </div>

      {hasSupabaseEnv() ? (
        <div className="mt-5">
          <MissionSettingsForm settings={snapshot.settings} />
        </div>
      ) : null}

      <div className="mt-5">
        {hasSupabaseEnv() ? <CreatePostForm /> : (
          <section className="terminal-panel rounded-[2rem] p-6 text-sm leading-6 text-muted">
            Connect Supabase env vars to unlock real admin publishing. The form is intentionally hidden in demo mode so fake posts do not imply persistence.
          </section>
        )}
      </div>

      {hasSupabaseEnv() ? (
        <div className="mt-5">
          <PostManager posts={snapshot.posts} failures={snapshot.failures} />
        </div>
      ) : null}
    </div>
  );
}
