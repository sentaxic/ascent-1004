export const dynamic = "force-dynamic";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { getFailures } from "@/lib/data";
import { padDay } from "@/lib/utils";

export default async function FailureArchivePage() {
  const failures = await getFailures();

  return (
    <div className="container-shell space-y-5 py-10 sm:py-14">
      <PageHero
        eyebrow="failure archive / public accountability"
        title="Accountability without hiding the hard parts."
        description="Missed days, broken streaks, and skipped tasks are recorded here after the mission starts. This page is not shame theatre; it is a public debugging log for discipline."
        actions={[{ href: "/timeline", label: "Read timeline", variant: "secondary" }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["failures", failures.length.toString().padStart(3, "0")],
            ["latest", failures[0]?.failureDate ?? "none"],
            ["instagram", failures.some((failure) => failure.autoPostedToInstagram) ? "triggered" : "idle"],
          ].map(([label, value]) => (
            <div key={label} className="soft-card rounded-2xl p-4">
              <p className="mono-label">{label}</p>
              <p className="mt-2 text-xl text-ash">{value}</p>
            </div>
          ))}
        </div>
      </PageHero>

      {failures.length > 0 ? (
        <div className="space-y-4">
          {failures.map((failure, index) => (
            <article key={failure.id} className="terminal-panel reveal rounded-[1.75rem] p-5" style={{ animationDelay: `${index * 70}ms` }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-redline/40 bg-redline/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-redline">{padDay(failure.dayNumber)}</span>
                <span className="text-xs text-muted">{failure.failureDate}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-ash">Missed public log</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{failure.reason}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 px-3 py-1 text-muted">severity: {failure.severity}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-muted">instagram: {failure.autoPostedToInstagram ? "triggered" : "not triggered"}</span>
                {failure.instagramPermalink ? <a href={failure.instagramPermalink} className="rounded-full border border-redline/30 px-3 py-1 text-redline">open proof</a> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          eyebrow="> NO FAILURES ARCHIVED"
          title="The failure log is empty."
          body="There are no missed days recorded yet. Since the mission is still clean, the archive stays quiet until the first real cutoff event happens."
          href="/timeline"
          action="Check timeline"
          tone="success"
        />
      )}
    </div>
  );
}
