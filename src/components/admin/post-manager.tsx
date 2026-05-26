import { clearFailuresAction, deletePostAction, resetMissionAction, updatePostAction } from "@/app/actions/admin";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import type { FailureEvent, Post } from "@/lib/types";
import { padDay } from "@/lib/utils";

export function PostManager({ posts, failures }: { posts: Post[]; failures: FailureEvent[] }) {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="admin / edit everything"
          title="Mission Data Controls"
          description="Fix titles, slugs, dates, progress numbers, tags, media URLs, drafts, deletes, failures, and zero-state resets."
        />
        <form action={clearFailuresAction}>
          <button className="button-secondary rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em]">
            Clear failures ({failures.length})
          </button>
        </form>
      </div>

      <details className="mt-5 rounded-2xl border border-redline/35 bg-redline/[0.06] p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ash">Full zero reset</summary>
        <p className="mt-3 text-xs leading-5 text-muted">Deletes posts, post media rows, comments, and failures. Your admin account, profile, mission settings, and Supabase project stay intact.</p>
        <form action={resetMissionAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input className="field rounded-2xl px-4 py-3 text-sm" name="confirmation" placeholder="Type RESET ASCENT" />
          <button className="button-danger rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Reset to zero</button>
        </form>
      </details>

      <div className="mt-6 space-y-4">
        {posts.length ? posts.map((post) => <EditablePost key={post.id} post={post} />) : (
          <EmptyState
            eyebrow="> NO POSTS TO EDIT"
            title="The archive is currently zeroed."
            body="Your first real publish will become DAY 001. No hidden demo posts are inflating the streak or progress numbers."
          />
        )}
      </div>
    </section>
  );
}

function EditablePost({ post }: { post: Post }) {
  return (
    <details className="rounded-2xl border border-white/10 bg-black/35 p-4" open={false}>
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mono-label text-redline">{padDay(post.dayNumber)} / {post.missionDate}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-ash">{post.title}</h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted">edit log</span>
        </div>
      </summary>

      <div className="mt-5 border-t border-white/10 pt-5">
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
          <div className="grid gap-3 lg:grid-cols-[1fr_0.75fr]">
            <label className="block space-y-2">
              <span className="mono-label">Title</span>
              <input className="field rounded-xl px-3 py-2" name="title" defaultValue={post.title} />
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Slug</span>
              <input className="field rounded-xl px-3 py-2" name="slug" defaultValue={post.slug} />
            </label>
          </div>
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
          <div className="grid gap-3 lg:grid-cols-2">
            <label className="block space-y-2">
              <span className="mono-label">Media URLs</span>
              <textarea className="field min-h-28 rounded-xl px-3 py-2" name="mediaUrls" defaultValue={post.media.map((item) => item.url).join("\n")} placeholder="One URL per line. Delete lines to remove media." />
              <span className="input-help">Saving replaces the media rows with this list plus any new uploads.</span>
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Add uploaded media</span>
              <input className="field rounded-xl px-3 py-2" name="mediaFiles" type="file" accept="image/*,.gif,video/*" multiple />
              <span className="input-help">New uploads are appended after the URL list.</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="button-primary rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em]">Save changes</button>
          </div>
        </form>
        <form action={deletePostAction} className="mt-3">
          <input type="hidden" name="postId" value={post.id} />
          <button className="button-danger rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em]">
            Delete this log
          </button>
        </form>
      </div>
    </details>
  );
}
