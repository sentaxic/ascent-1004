import Link from "next/link";

import { PostCard } from "@/components/posts/post-card";
import type { Post } from "@/lib/types";

export function LatestPost({ post }: { post: Post }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mono-label text-redline">latest transmission</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Mission Log</h2>
        </div>
        <Link href="/timeline" className="glow-link rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted">View all</Link>
      </div>
      <PostCard post={post} compact />
    </section>
  );
}
