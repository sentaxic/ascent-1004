import { updateMissionSettingsAction } from "@/app/actions/admin";
import { SectionHeading } from "@/components/ui/section-heading";
import type { MissionSettings } from "@/lib/types";

export function MissionSettingsForm({ settings }: { settings: MissionSettings }) {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <SectionHeading
        eyebrow="admin / mission settings"
        title="Edit timer, cutoff, and public copy"
        description="Use this when the deadline changes, the mission timezone needs fixing, or the homepage wording should sound more like you."
      />
      <form action={updateMissionSettingsAction} className="mt-5 space-y-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 sm:p-5">
          <p className="mono-label text-redline">countdown targets</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block space-y-2">
              <span className="mono-label">MIT application deadline</span>
              <input className="field rounded-2xl px-4 py-3" name="applicationDeadline" defaultValue={settings.applicationDeadline} placeholder="2029-01-05T23:59:59+05:30" required />
              <span className="input-help">ISO date/time with timezone is safest for production.</span>
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Pi Day decision horizon</span>
              <input className="field rounded-2xl px-4 py-3" name="decisionHorizon" defaultValue={settings.decisionHorizon} placeholder="2029-03-14T15:14:00+05:30" required />
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Mission timezone</span>
              <input className="field rounded-2xl px-4 py-3" name="missionTimeZone" defaultValue={settings.missionTimeZone} placeholder="Asia/Kolkata" required />
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Missed-day cutoff hour</span>
              <input className="field rounded-2xl px-4 py-3" name="missedDayCutoffHour" type="number" min="0" max="23" defaultValue={settings.missedDayCutoffHour} required />
              <span className="input-help">0-23 local hour. Vercel Hobby currently checks daily at 22:00 IST.</span>
            </label>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 sm:p-5">
          <p className="mono-label text-redline">homepage language</p>
          <div className="mt-4 space-y-4">
            <label className="block space-y-2">
              <span className="mono-label">Countdown label</span>
              <input className="field rounded-2xl px-4 py-3" name="countdownLabel" defaultValue={settings.countdownLabel} />
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Countdown description</span>
              <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="countdownDescription" defaultValue={settings.countdownDescription} />
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Next action copy</span>
              <input className="field rounded-2xl px-4 py-3" name="nextActionCopy" defaultValue={settings.nextActionCopy} />
              <span className="input-help">Use <span className="text-ash">{"{day}"}</span> where the next day number should appear.</span>
            </label>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 sm:p-5">
          <p className="mono-label text-redline">operator card</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block space-y-2">
              <span className="mono-label">Operator name</span>
              <input className="field rounded-2xl px-4 py-3" name="operatorName" defaultValue={settings.operatorName} />
            </label>
            <label className="block space-y-2">
              <span className="mono-label">Operator title</span>
              <input className="field rounded-2xl px-4 py-3" name="operatorTitle" defaultValue={settings.operatorTitle} />
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className="mono-label">Operator bio</span>
            <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="operatorBio" defaultValue={settings.operatorBio} />
          </label>
        </div>

        <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Save mission settings</button>
      </form>
    </section>
  );
}
