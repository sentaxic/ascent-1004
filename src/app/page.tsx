export const dynamic = "force-dynamic";

import { Countdown } from "@/components/home/countdown";
import { LatestPost } from "@/components/home/latest-post";
import { MetricGrid } from "@/components/home/metric-grid";
import { MissionOverview } from "@/components/home/mission-overview";
import { MissionSidebar } from "@/components/home/mission-sidebar";
import { getDashboardSnapshot } from "@/lib/data";

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <div className="container-shell py-8 sm:py-12">
      <div className="grid gap-5 lg:grid-cols-12">
        <Countdown settings={snapshot.settings} />
        <MissionSidebar latestPost={snapshot.latestPost} failures={snapshot.failures} settings={snapshot.settings} />
      </div>
      <div className="mt-5">
        <MetricGrid metrics={snapshot.metrics} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <MissionOverview dailyMetrics={snapshot.dailyMetrics} />
        <LatestPost post={snapshot.latestPost} />
      </div>
    </div>
  );
}
