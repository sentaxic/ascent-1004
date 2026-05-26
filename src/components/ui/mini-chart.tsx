import type { AnalyticsPoint, DailyMetric } from "@/lib/types";

export function StudyChart({ data }: { data: DailyMetric[] }) {
  const max = Math.max(...data.map((point) => point.studyHours), 1);

  return (
    <div className="grid h-52 grid-cols-6 items-end gap-3 rounded-2xl border border-white/10 bg-black/35 p-4">
      {data.map((point) => (
        <div key={point.date} className="flex h-full flex-col justify-end gap-2">
          <div className="relative flex-1 rounded-full bg-white/[0.04]">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-redline/80 to-ash shadow-[0_0_20px_rgba(255,59,48,0.2)] transition-all duration-700"
              style={{ height: `${(point.studyHours / max) * 100}%` }}
            />
          </div>
          <span className="text-center text-[0.62rem] text-muted">{point.date.replace("May ", "")}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsChart({ data }: { data: AnalyticsPoint[] }) {
  const maxVisitors = Math.max(...data.map((point) => point.visitors), 1);

  return (
    <div className="space-y-3">
      {data.map((point) => (
        <div key={point.label} className="grid grid-cols-[42px_1fr_58px] items-center gap-3 text-xs">
          <span className="text-muted">{point.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-redline/80 to-ash transition-all duration-700"
              style={{ width: `${(point.visitors / maxVisitors) * 100}%` }}
            />
          </div>
          <span className="text-right text-ash">{point.visitors}</span>
        </div>
      ))}
    </div>
  );
}
