import Link from "next/link";

import { PostCard } from "@/components/posts/post-card";
import type { Post } from "@/lib/types";

export function LatestPost({ post }: { post: Post | null }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mono-label text-redline">latest transmission</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Mission Log</h2>
        </div>
        <Link href="/timeline" className="glow-link rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted">View all</Link>
      </div>
      {post ? (
        <PostCard post={post} compact />
      ) : (
        <div className="terminal-panel rounded-[1.75rem] p-8 text-center border border-dashed border-redline/25 bg-black/45">
          <p className="font-mono text-sm text-redline animate-pulse">&gt; NO LOGS TRANSMITTED YET</p>
          <p className="mt-3 text-xs leading-5 text-muted max-w-sm mx-auto">
            The mission archive is live. Day 001 log transmission is pending from the operator console.
          </p>
          <div className="mt-4">
            <Link href="/admin" className="button-primary text-[10px] rounded-full px-4 py-2 uppercase tracking-widest inline-block">
              Open Operator Console
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
