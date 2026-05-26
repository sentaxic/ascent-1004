import { StatusDot } from "@/components/ui/status-dot";
import type { MissionMetric } from "@/lib/types";

export function MetricGrid({ metrics }: { metrics: MissionMetric[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <article key={metric.label} className="terminal-panel reveal overflow-hidden rounded-3xl p-5" style={{ animationDelay: `${140 + index * 70}ms` }}>
          <div className="flex items-center justify-between gap-4">
            <p className="mono-label">{metric.label}</p>
            <StatusDot status={metric.status} />
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-ash">{metric.value}</p>
          <p className="mt-2 text-xs leading-5 text-muted">{metric.delta}</p>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-redline/60 via-white/10 to-transparent" />
        </article>
      ))}
    </section>
  );
}
