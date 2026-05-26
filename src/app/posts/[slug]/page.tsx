export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentSection } from "@/components/comments/comment-section";
import { MediaGrid } from "@/components/posts/media-grid";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatMissionDate } from "@/lib/config";
import { getCurrentProfile, getPostBySlug } from "@/lib/data";
import { padDay } from "@/lib/utils";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, profile] = await Promise.all([getPostBySlug(slug), getCurrentProfile()]);
  if (!post) notFound();

  return (
    <div className="container-shell space-y-5 py-10 sm:py-14">
      <div className="flex flex-wrap gap-3">
        <Link href="/timeline" className="button-secondary rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]">Back to timeline</Link>
        <Link href="#comments" className="glow-link rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted">Comments ({post.comments.length})</Link>
      </div>

      <article className="terminal-panel overflow-hidden rounded-[2.25rem] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-redline/40 bg-redline/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-redline">{padDay(post.dayNumber)}</span>
          <time className="text-xs text-muted">{formatMissionDate(post.publishedAt)}</time>
        </div>
        <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.08em] text-ash sm:text-6xl">{post.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{post.excerpt}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {[
            ["mission date", post.missionDate],
            ["study", `${post.studyHours}h`],
            ["streak", `${post.streakAfterPost} days`],
            ["media", post.media.length.toString()],
          ].map(([label, value]) => (
            <div key={label} className="soft-card rounded-2xl p-4">
              <p className="mono-label">{label}</p>
              <p className="mt-2 text-xl text-ash">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <MediaGrid media={post.media} />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <ProgressBar value={Math.min(post.studyHours * 20, 100)} label={`${post.studyHours}h study`} />
          <ProgressBar value={post.gymComplete ? 100 : 12} label={post.gymComplete ? "gym complete" : "gym skipped"} />
          <ProgressBar value={post.physicsProgress} label="physics" />
        </div>
        <div className="mt-8 max-w-none rounded-[1.5rem] border border-white/10 bg-black/30 p-5 text-muted sm:p-6">
          {post.content.split("\n").filter(Boolean).map((paragraph) => <p key={paragraph} className="mb-5 leading-8 last:mb-0">{paragraph}</p>)}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">#{tag}</span>)}
        </div>
      </article>
      <CommentSection post={post} profile={profile} />
    </div>
  );
}
