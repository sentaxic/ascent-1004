export const dynamic = "force-dynamic";

import { PostCard } from "@/components/posts/post-card";
import { getPosts } from "@/lib/data";

export default async function TimelinePage() {
  const posts = await getPosts();

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="mono-label text-redline">timeline / public logs</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.07em] text-ash sm:text-6xl">Daily Archive</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Every published entry gets a numbered day identifier, timestamp, tags, progress data, media, and comments.</p>
      </div>
      {posts.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="terminal-panel rounded-[2rem] p-10 text-center border border-dashed border-white/10 bg-black/45 max-w-2xl mx-auto">
          <p className="font-mono text-sm text-redline animate-pulse">&gt; LOG ARCHIVE EMPTY</p>
          <p className="mt-4 text-xs leading-5 text-muted">
            No entries have been published to the public archive yet. Day 001 log transmission is pending operator initialization.
          </p>
        </div>
      )}
    </div>
  );
}
