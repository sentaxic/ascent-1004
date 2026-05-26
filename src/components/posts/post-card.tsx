import Link from "next/link";

import { MediaGrid } from "@/components/posts/media-grid";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatMissionDate } from "@/lib/config";
import type { Post } from "@/lib/types";
import { padDay } from "@/lib/utils";

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <article className="terminal-panel reveal overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-redline/40 bg-redline/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-redline">{padDay(post.dayNumber)}</span>
        <time className="text-xs text-muted">{formatMissionDate(post.publishedAt)}</time>
      </div>
      <Link href={`/posts/${post.slug}`}>
        <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-ash transition hover:text-redline sm:text-3xl">{post.title}</h2>
      </Link>
      <p className="mt-3 text-sm leading-6 text-muted">{post.excerpt}</p>
      {!compact ? <div className="mt-5"><MediaGrid media={post.media} /></div> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <ProgressBar value={Math.min(post.studyHours * 20, 100)} label={`${post.studyHours}h study`} />
        <ProgressBar value={post.gymComplete ? 100 : 12} label={post.gymComplete ? "gym complete" : "gym skipped"} />
        <ProgressBar value={post.physicsProgress} label="physics" />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.length ? post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">#{tag}</span>
          )) : <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">untagged</span>}
        </div>
        <Link href={`/posts/${post.slug}#comments`} className="text-xs uppercase tracking-[0.16em] text-redline">
          {post.comments.length} comments
        </Link>
      </div>
    </article>
  );
}
