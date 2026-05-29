import { createPostAction } from "@/app/actions/posts";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ContentSection } from "@/lib/types";
import { padDay } from "@/lib/utils";

export function CreatePostForm({ nextDay = 1, sections = [] }: { nextDay?: number; sections?: ContentSection[] }) {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <SectionHeading
        eyebrow="admin / publish"
        title={`Create ${padDay(nextDay)}`}
        description="Classified mission log composer with section routing, objectives, failures, lessons, metrics, and cinematic media uploads."
      />
      <form action={createPostAction} className="mt-5 space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <label className="block space-y-2">
            <span className="mono-label">Post title</span>
            <input className="field rounded-2xl px-4 py-3" name="title" placeholder="What happened today?" required />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Section</span>
            <select className="field rounded-2xl px-4 py-3" name="sectionId" defaultValue={sections[0]?.id ?? "mission-log"}>
              {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <label className="block space-y-2">
            <span className="mono-label">Mission date</span>
            <input className="field rounded-2xl px-4 py-3" name="missionDate" type="date" />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Tags</span>
            <input className="field rounded-2xl px-4 py-3" name="tags" placeholder="physics, coding, gym, discipline" />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="mono-label">Short excerpt</span>
          <textarea className="field min-h-20 rounded-2xl px-4 py-3" name="excerpt" placeholder="One or two lines that summarize the day." />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Objectives</span>
          <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="objective" placeholder="What was the mission objective?" />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Failures</span>
          <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="failures" placeholder="What broke, slipped, or needs to be confronted?" />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Lessons learned</span>
          <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="lessons" placeholder="What changed because of today?" />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Full mission log</span>
          <textarea className="field min-h-44 rounded-2xl px-4 py-3" name="content" placeholder="Study notes, failures, wins, physics progress, what changes tomorrow..." required />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block space-y-2">
            <span className="mono-label">Study hours</span>
            <input className="field rounded-2xl px-4 py-3" name="studyHours" type="number" min="0" step="0.25" placeholder="0.0" />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Physics %</span>
            <input className="field rounded-2xl px-4 py-3" name="physicsProgress" type="number" min="0" max="100" step="1" placeholder="0" />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Coding %</span>
            <input className="field rounded-2xl px-4 py-3" name="codingProgress" type="number" min="0" max="100" step="1" placeholder="0" />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Weight kg</span>
            <input className="field rounded-2xl px-4 py-3" name="weightKg" type="number" min="0" step="0.1" placeholder="0.0" />
          </label>
          <label className="flex items-end gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted">
            <input name="gymComplete" type="checkbox" className="accent-redline" /> Gym completed
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted">
            <input name="featured" type="checkbox" className="accent-redline" /> Feature this post globally
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted">
            <input name="pinned" type="checkbox" className="accent-redline" /> Pin in its section
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="mono-label">Embed or media URLs</span>
            <textarea className="field min-h-28 rounded-2xl px-4 py-3" name="mediaUrls" placeholder="One URL per line" />
            <span className="input-help">Use this for hosted videos, GIFs, or external embeds.</span>
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Upload images, GIFs, or videos</span>
            <input className="field rounded-2xl px-4 py-3" name="mediaFiles" type="file" accept="image/*,.gif,video/*" multiple />
            <span className="input-help">Files go to Appwrite Storage and render in the fullscreen cinematic media viewer.</span>
          </label>
        </div>

        <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Publish log</button>
      </form>
    </section>
  );
}
