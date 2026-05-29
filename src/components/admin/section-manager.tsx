import { archiveSectionAction, createSectionAction, deleteSectionAction, duplicateSectionAction, updateSectionAction } from "@/app/actions/admin";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ContentSection } from "@/lib/types";

const themes = ["terminal", "physics", "gym", "philosophy", "ai", "archive"];
const layouts = ["timeline", "magazine", "research", "gallery"];

export function SectionManager({ sections }: { sections: ContentSection[] }) {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <SectionHeading
        eyebrow="content architecture manager"
        title="Dynamic Section Manager"
        description="Create, theme, archive, duplicate, reorder, and route independent content worlds without changing core code."
      />

      <form action={createSectionAction} className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-4 sm:p-5">
        <p className="mono-label text-redline">create section</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <input className="field rounded-2xl px-4 py-3" name="name" placeholder="AI Research" required />
          <input className="field rounded-2xl px-4 py-3" name="slug" placeholder="ai-research" />
          <input className="field rounded-2xl px-4 py-3" name="icon" placeholder="AI" />
          <input className="field rounded-2xl px-4 py-3" name="accentColor" placeholder="#5aa7ff" />
        </div>
        <textarea className="field mt-4 min-h-24 rounded-2xl px-4 py-3" name="description" placeholder="What belongs in this archive?" />
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <select className="field rounded-2xl px-4 py-3" name="theme" defaultValue="terminal">
            {themes.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
          </select>
          <select className="field rounded-2xl px-4 py-3" name="layout" defaultValue="timeline">
            {layouts.map((layout) => <option key={layout} value={layout}>{layout}</option>)}
          </select>
          <select className="field rounded-2xl px-4 py-3" name="visibility" defaultValue="public">
            <option value="public">public</option>
            <option value="private">private</option>
          </select>
          <input className="field rounded-2xl px-4 py-3" name="sortOrder" type="number" placeholder="order" />
          <input className="field rounded-2xl px-4 py-3" name="moderatorIds" placeholder="moderator ids" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <input className="field rounded-2xl px-4 py-3" name="banner" type="file" accept="image/*,.gif" />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted"><input name="commentsEnabled" type="checkbox" defaultChecked className="accent-redline" /> comments</label>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted"><input name="featured" type="checkbox" className="accent-redline" /> featured</label>
        </div>
        <button className="button-primary mt-4 rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Create section</button>
      </form>

      <div className="mt-6 space-y-4">
        {sections.map((section) => (
          <details key={section.id} className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl border border-white/10 text-sm" style={{ color: section.accentColor }}>{section.icon}</span>
                  <div>
                    <p className="text-lg font-semibold text-ash">{section.name}</p>
                    <p className="text-xs text-muted">/{section.slug} / {section.theme} / {section.layout}</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted">drag order {section.sortOrder}</span>
              </div>
            </summary>

            <form action={updateSectionAction} className="mt-5 space-y-4 border-t border-white/10 pt-5">
              <input type="hidden" name="sectionId" value={section.id} />
              <div className="grid gap-4 lg:grid-cols-4">
                <input className="field rounded-2xl px-4 py-3" name="name" defaultValue={section.name} />
                <input className="field rounded-2xl px-4 py-3" name="slug" defaultValue={section.slug} />
                <input className="field rounded-2xl px-4 py-3" name="icon" defaultValue={section.icon} />
                <input className="field rounded-2xl px-4 py-3" name="accentColor" defaultValue={section.accentColor} />
              </div>
              <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="description" defaultValue={section.description} />
              <div className="grid gap-4 lg:grid-cols-6">
                <select className="field rounded-2xl px-4 py-3" name="theme" defaultValue={section.theme}>{themes.map((theme) => <option key={theme} value={theme}>{theme}</option>)}</select>
                <select className="field rounded-2xl px-4 py-3" name="layout" defaultValue={section.layout}>{layouts.map((layout) => <option key={layout} value={layout}>{layout}</option>)}</select>
                <select className="field rounded-2xl px-4 py-3" name="visibility" defaultValue={section.visibility}><option value="public">public</option><option value="private">private</option></select>
                <input className="field rounded-2xl px-4 py-3" name="sortOrder" type="number" defaultValue={section.sortOrder} />
                <input className="field rounded-2xl px-4 py-3" name="parentId" defaultValue={section.parentId ?? ""} placeholder="parent id" />
                <input className="field rounded-2xl px-4 py-3" name="moderatorIds" defaultValue={section.moderatorIds.join(", ")} />
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
                <input className="field rounded-2xl px-4 py-3" name="banner" type="file" accept="image/*,.gif" />
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted"><input name="commentsEnabled" type="checkbox" defaultChecked={section.commentsEnabled} className="accent-redline" /> comments</label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted"><input name="featured" type="checkbox" defaultChecked={section.featured} className="accent-redline" /> featured</label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-muted"><input name="archived" type="checkbox" defaultChecked={section.archived} className="accent-redline" /> archived</label>
              </div>
              <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Save section</button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3">
              <form action={duplicateSectionAction}><input type="hidden" name="sectionId" value={section.id} /><button className="button-secondary rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em]">Duplicate</button></form>
              <form action={archiveSectionAction}><input type="hidden" name="sectionId" value={section.id} /><button className="button-secondary rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em]">Archive</button></form>
              <form action={deleteSectionAction} className="flex flex-wrap gap-2"><input type="hidden" name="sectionId" value={section.id} /><input className="field rounded-xl px-3 py-2 text-xs" name="confirmation" placeholder="DELETE SECTION" /><button className="button-danger rounded-xl px-4 py-2 text-xs uppercase tracking-[0.16em]">Delete</button></form>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
