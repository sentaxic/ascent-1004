import { clearFailuresAction, deletePostAction, resetMissionAction, updatePostAction } from "@/app/actions/admin";
import type { FailureEvent, Post } from "@/lib/types";

export function PostManager({ posts, failures }: { posts: Post[]; failures: FailureEvent[] }) {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label text-redline">admin / edit everything</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Mission Data Controls</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Edit any published log, delete mistaken entries, clear failure records, or reset the whole mission back to zero before the real Day 001.
          </p>
        </div>
        <form action={clearFailuresAction}>
          <button className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted transition hover:border-redline/50 hover:text-ash">
            Clear failures ({failures.length})
          </button>
        </form>
      </div>

      <form action={resetMissionAction} className="mt-5 rounded-2xl border border-redline/35 bg-redline/[0.06] p-4">
        <p className="text-sm font-semibold text-ash">Full zero reset</p>
        <p className="mt-2 text-xs leading-5 text-muted">Deletes posts, post media rows, comments, and failures. Your admin account/profile stays intact.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input className="field rounded-2xl px-4 py-3 text-sm" name="confirmation" placeholder="Type RESET ASCENT" />
          <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Reset to zero</button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {posts.length ? posts.map((post) => <EditablePost key={post.id} post={post} />) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/35 p-6 text-center">
            <p className="text-sm text-redline">&gt; NO POSTS TO EDIT</p>
            <p className="mt-2 text-xs text-muted">The archive is currently zeroed. Your first real publish will become DAY 001.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function EditablePost({ post }: { post: Post }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <form action={updatePostAction} className="space-y-4">
        <input type="hidden" name="postId" value={post.id} />
        <input type="hidden" name="originalSlug" value={post.slug} />
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="space-y-2 sm:col-span-1">
            <span className="mono-label">Day</span>
            <input className="field rounded-xl px-3 py-2" name="dayNumber" type="number" min="1" defaultValue={post.dayNumber} />
          </label>
          <label className="space-y-2 sm:col-span-1">
            <span className="mono-label">Streak</span>
            <input className="field rounded-xl px-3 py-2" name="streakAfterPost" type="number" min="0" defaultValue={post.streakAfterPost} />
          </label>
          <label className="space-y-2 sm:col-span-2">
            <span className="mono-label">Mission date</span>
            <input className="field rounded-xl px-3 py-2" name="missionDate" type="date" defaultValue={post.missionDate} />
          </label>
        </div>
        <label className="block space-y-2">
          <span className="mono-label">Title</span>
          <input className="field rounded-xl px-3 py-2" name="title" defaultValue={post.title} />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Slug</span>
          <input className="field rounded-xl px-3 py-2" name="slug" defaultValue={post.slug} />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Excerpt</span>
          <textarea className="field min-h-20 rounded-xl px-3 py-2" name="excerpt" defaultValue={post.excerpt} />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Content</span>
          <textarea className="field min-h-32 rounded-xl px-3 py-2" name="content" defaultValue={post.content} />
        </label>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="space-y-2">
            <span className="mono-label">Study h</span>
            <input className="field rounded-xl px-3 py-2" name="studyHours" type="number" min="0" step="0.25" defaultValue={post.studyHours} />
          </label>
          <label className="space-y-2">
            <span className="mono-label">Physics %</span>
            <input className="field rounded-xl px-3 py-2" name="physicsProgress" type="number" min="0" max="100" defaultValue={post.physicsProgress} />
          </label>
          <label className="space-y-2">
            <span className="mono-label">Status</span>
            <select className="field rounded-xl px-3 py-2" name="status" defaultValue="published">
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </label>
          <label className="flex items-end gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-muted">
            <input name="gymComplete" type="checkbox" className="accent-redline" defaultChecked={post.gymComplete} /> Gym
          </label>
        </div>
        <label className="block space-y-2">
          <span className="mono-label">Tags</span>
          <input className="field rounded-xl px-3 py-2" name="tags" defaultValue={post.tags.join(", ")} />
        </label>
        <div className="flex flex-wrap gap-3">
          <button className="button-primary rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em]">Save changes</button>
        </div>
      </form>
      <form action={deletePostAction} className="mt-3">
        <input type="hidden" name="postId" value={post.id} />
        <button className="rounded-xl border border-redline/40 bg-redline/[0.06] px-4 py-2 text-xs uppercase tracking-[0.16em] text-redline transition hover:bg-redline/[0.12]">
          Delete this log
        </button>
      </form>
    </article>
  );
}
