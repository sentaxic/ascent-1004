import { StudyChart } from "@/components/ui/mini-chart";
import { SectionHeading } from "@/components/ui/section-heading";
import type { DailyMetric } from "@/lib/types";

export function MissionOverview({ dailyMetrics }: { dailyMetrics: DailyMetric[] }) {
  const hasData = dailyMetrics.some((point) => point.studyHours > 0 || point.physicsPercent > 0 || point.streak > 0 || point.gymComplete);

  return (
    <section className="terminal-panel reveal rounded-[2rem] p-5 sm:p-6" style={{ animationDelay: "260ms" }}>
      <SectionHeading
        eyebrow="telemetry"
        title="Study Load Graph"
        description="A light, readable chart that wakes up from real post data. Zero stays zero until you publish."
      />
      <div className="mt-5">
        <StudyChart data={dailyMetrics} />
      </div>
      {!hasData ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-muted">
          No telemetry yet. Your first published log will start the graph, streak, and consistency calculations.
        </p>
      ) : null}
    </section>
  );
}
