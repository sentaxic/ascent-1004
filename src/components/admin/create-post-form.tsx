import { createPostAction } from "@/app/actions/posts";

export function CreatePostForm() {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <p className="mono-label text-redline">admin / publish</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Create Daily Log</h2>
      <form action={createPostAction} className="mt-5 space-y-4">
        <input className="field rounded-2xl px-4 py-3" name="title" placeholder="Post title" required />
        <textarea className="field min-h-20 rounded-2xl px-4 py-3" name="excerpt" placeholder="Short excerpt" />
        <textarea className="field min-h-44 rounded-2xl px-4 py-3" name="content" placeholder="Mission log content" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="field rounded-2xl px-4 py-3" name="missionDate" type="date" />
          <input className="field rounded-2xl px-4 py-3" name="tags" placeholder="physics, gym, calculus" />
          <input className="field rounded-2xl px-4 py-3" name="studyHours" type="number" min="0" step="0.25" placeholder="Study hours" />
          <input className="field rounded-2xl px-4 py-3" name="physicsProgress" type="number" min="0" max="100" step="1" placeholder="Physics progress %" />
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted">
          <input name="gymComplete" type="checkbox" className="accent-redline" /> Gym completed today
        </label>
        <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="mediaUrls" placeholder="Optional media URLs, one per line" />
        <label className="block space-y-2">
          <span className="mono-label">Upload images, GIFs, or videos</span>
          <input className="field rounded-2xl px-4 py-3" name="mediaFiles" type="file" accept="image/*,.gif,video/*" multiple />
        </label>
        <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Publish log</button>
      </form>
    </section>
  );
}
