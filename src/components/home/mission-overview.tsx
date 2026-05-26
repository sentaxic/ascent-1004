import { StudyChart } from "@/components/ui/mini-chart";
import type { DailyMetric } from "@/lib/types";

export function MissionOverview({ dailyMetrics }: { dailyMetrics: DailyMetric[] }) {
  return (
    <section className="terminal-panel reveal rounded-[2rem] p-5 sm:p-6" style={{ animationDelay: "260ms" }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-redline">telemetry</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Study Load Graph</h2>
        </div>
        <p className="max-w-md text-xs leading-5 text-muted">Lightweight CSS chart, no corporate dashboard sludge. Bars update from post data once Supabase is connected.</p>
      </div>
      <div className="mt-5">
        <StudyChart data={dailyMetrics} />
      </div>
    </section>
  );
}
