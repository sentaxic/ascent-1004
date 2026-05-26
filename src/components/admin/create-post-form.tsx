import { createPostAction } from "@/app/actions/posts";
import { SectionHeading } from "@/components/ui/section-heading";
import { padDay } from "@/lib/utils";

export function CreatePostForm({ nextDay = 1 }: { nextDay?: number }) {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <SectionHeading
        eyebrow="admin / publish"
        title={`Create ${padDay(nextDay)}`}
        description="Fill the real daily numbers, write the reflection, attach proof if useful, and publish once. The site handles the archive and dashboard update."
      />
      <form action={createPostAction} className="mt-5 space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <label className="block space-y-2">
            <span className="mono-label">Post title</span>
            <input className="field rounded-2xl px-4 py-3" name="title" placeholder="What happened today?" required />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Mission date</span>
            <input className="field rounded-2xl px-4 py-3" name="missionDate" type="date" />
            <span className="input-help">Leave blank to use today.</span>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="mono-label">Short excerpt</span>
          <textarea className="field min-h-20 rounded-2xl px-4 py-3" name="excerpt" placeholder="One or two lines that summarize the day." />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Full mission log</span>
          <textarea className="field min-h-44 rounded-2xl px-4 py-3" name="content" placeholder="Study notes, failures, wins, physics progress, what changes tomorrow..." required />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block space-y-2">
            <span className="mono-label">Study hours</span>
            <input className="field rounded-2xl px-4 py-3" name="studyHours" type="number" min="0" step="0.25" placeholder="0.0" />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Physics progress %</span>
            <input className="field rounded-2xl px-4 py-3" name="physicsProgress" type="number" min="0" max="100" step="1" placeholder="0" />
          </label>
          <label className="block space-y-2 sm:col-span-2">
            <span className="mono-label">Tags</span>
            <input className="field rounded-2xl px-4 py-3" name="tags" placeholder="physics, gym, calculus" />
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted">
          <input name="gymComplete" type="checkbox" className="accent-redline" /> Gym completed today
        </label>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="mono-label">Embed or media URLs</span>
            <textarea className="field min-h-28 rounded-2xl px-4 py-3" name="mediaUrls" placeholder="One URL per line" />
            <span className="input-help">Use this for hosted videos, GIFs, or external embeds.</span>
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Upload images, GIFs, or videos</span>
            <input className="field rounded-2xl px-4 py-3" name="mediaFiles" type="file" accept="image/*,.gif,video/*" multiple />
            <span className="input-help">Large files go to Supabase Storage and become public post media.</span>
          </label>
        </div>

        <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Publish log</button>
      </form>
    </section>
  );
}
