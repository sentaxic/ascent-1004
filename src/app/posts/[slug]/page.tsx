export const dynamic = "force-dynamic";

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
    <div className="container-shell py-10 sm:py-14">
      <article className="terminal-panel rounded-[2rem] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-redline/40 bg-redline/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-redline">{padDay(post.dayNumber)}</span>
          <time className="text-xs text-muted">{formatMissionDate(post.publishedAt)}</time>
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.07em] text-ash sm:text-6xl">{post.title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">{post.excerpt}</p>
        <div className="mt-8">
          <MediaGrid media={post.media} />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <ProgressBar value={Math.min(post.studyHours * 20, 100)} label={`${post.studyHours}h study`} />
          <ProgressBar value={post.gymComplete ? 100 : 12} label={post.gymComplete ? "gym complete" : "gym skipped"} />
          <ProgressBar value={post.physicsProgress} label="physics" />
        </div>
        <div className="mt-8 max-w-none text-muted">
          {post.content.split("\n").map((paragraph) => <p key={paragraph} className="mb-5 leading-8">{paragraph}</p>)}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">#{tag}</span>)}
        </div>
      </article>
      <div className="mt-5">
        <CommentSection post={post} profile={profile} />
      </div>
    </div>
  );
}
