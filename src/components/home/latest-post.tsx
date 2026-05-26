import Link from "next/link";

import { PostCard } from "@/components/posts/post-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Post } from "@/lib/types";

export function LatestPost({ post }: { post: Post | null }) {
  return (
    <section className="space-y-4">
      <SectionHeading eyebrow="latest transmission" title="Mission Log" />
      {post ? (
        <PostCard post={post} compact />
      ) : (
        <div className="terminal-panel rounded-[1.75rem] border border-dashed border-redline/25 bg-black/45 p-8 text-center">
          <p className="font-mono text-sm text-redline animate-pulse">&gt; NO LOGS TRANSMITTED YET</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-ash">Day 001 is still clean.</h3>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-muted">
            The public archive is live, but no fake progress is being displayed. Publish the first real log when you are ready.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/timeline" className="button-secondary rounded-full px-4 py-2 text-[10px] uppercase tracking-widest">
              View archive
            </Link>
            <Link href="/admin" className="button-primary rounded-full px-4 py-2 text-[10px] uppercase tracking-widest">
              Open console
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
