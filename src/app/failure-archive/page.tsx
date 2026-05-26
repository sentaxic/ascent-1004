export const dynamic = "force-dynamic";

import { getFailures } from "@/lib/data";
import { padDay } from "@/lib/utils";

export default async function FailureArchivePage() {
  const failures = await getFailures();

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="mono-label text-redline">failure archive / public accountability</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.07em] text-ash sm:text-6xl">Missed Days Do Not Vanish</h1>
        <p className="mt-4 text-sm leading-6 text-muted">The cron endpoint records missed posts after cutoff and can trigger an Instagram announcement via Graph API or webhook.</p>
      </div>
      <div className="space-y-4">
        {failures.map((failure, index) => (
          <article key={failure.id} className="terminal-panel reveal rounded-[1.75rem] p-5" style={{ animationDelay: `${index * 70}ms` }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-redline/40 bg-redline/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-redline">{padDay(failure.dayNumber)}</span>
              <span className="text-xs text-muted">{failure.failureDate}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">{failure.reason}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 px-3 py-1 text-muted">severity: {failure.severity}</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-muted">instagram: {failure.autoPostedToInstagram ? "triggered" : "not triggered"}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
