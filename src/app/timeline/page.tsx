export const dynamic = "force-dynamic";

import { PostCard } from "@/components/posts/post-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { getPosts } from "@/lib/data";

export default async function TimelinePage() {
  const posts = await getPosts();

  return (
    <div className="container-shell space-y-5 py-10 sm:py-14">
      <PageHero
        eyebrow="timeline / public logs"
        title="Every real day gets a receipt."
        description="The archive is designed to be readable first: numbered DAY ### entries, timestamps, tags, progress logs, media, and observer comments. No post means no fake progress."
        actions={[{ href: "/failure-archive", label: "Failure archive", variant: "secondary" }]}
      >
        <div className="flex flex-wrap gap-2">
          {["all logs", "physics", "gym", "study", "media"].map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted">
              {item}
            </span>
          ))}
        </div>
      </PageHero>

      {posts.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <EmptyState
          eyebrow="> LOG ARCHIVE EMPTY"
          title="Day 001 has not been published yet."
          body="The site is ready, but the mission has not started. When Micheal publishes the first real log, it will appear here as DAY 001 and the dashboard will begin counting from actual data."
          href="/"
          action="Back to command center"
        />
      )}
    </div>
  );
}
