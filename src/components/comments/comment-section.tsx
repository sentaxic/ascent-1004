import { createCommentAction } from "@/app/actions/comments";
import type { Comment, Post, Profile } from "@/lib/types";

export function CommentSection({ post, profile }: { post: Post; profile: Profile | null }) {
  return (
    <section id="comments" className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label text-redline">comments</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Observer Thread</h2>
        </div>
        <p className="text-xs text-muted">{post.comments.length} entries</p>
      </div>
      <div className="mt-5 space-y-3">
        {post.comments.length ? post.comments.map((comment) => <CommentItem key={comment.id} comment={comment} />) : <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">No comments yet. Quiet lab, humming lights.</p>}
      </div>
      {profile ? (
        <form action={createCommentAction} className="mt-5 space-y-3">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="slug" value={post.slug} />
          <textarea className="field min-h-28 rounded-2xl px-4 py-3" name="body" maxLength={1200} placeholder="Add an observation..." required />
          <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Transmit comment</button>
        </form>
      ) : (
        <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">Log in to comment. Publishing remains locked to Micheal.</p>
      )}
    </section>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-xs text-ash">{comment.author.displayName.slice(0, 1)}</div>
          <div>
            <p className="text-sm text-ash">{comment.author.displayName}</p>
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted">@{comment.author.username} / {comment.author.role}</p>
          </div>
        </div>
        <time className="text-xs text-muted">{new Date(comment.createdAt).toLocaleDateString()}</time>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{comment.body}</p>
    </article>
  );
}
