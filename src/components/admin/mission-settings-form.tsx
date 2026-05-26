import { updateMissionSettingsAction } from "@/app/actions/admin";
import type { MissionSettings } from "@/lib/types";

export function MissionSettingsForm({ settings }: { settings: MissionSettings }) {
  return (
    <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
      <p className="mono-label text-redline">admin / mission settings</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Edit Timer & Dashboard Copy</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
        Change the countdown target, Pi Day horizon, cutoff rules, and the text shown on the public command center. Use ISO strings with timezone offsets so the timer does not shift in production.
      </p>
      <form action={updateMissionSettingsAction} className="mt-5 space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="mono-label">MIT application deadline</span>
            <input className="field rounded-2xl px-4 py-3" name="applicationDeadline" defaultValue={settings.applicationDeadline} placeholder="2029-01-05T23:59:59+05:30" required />
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
          </label>
        </div>
        <label className="block space-y-2">
          <span className="mono-label">Countdown label</span>
          <input className="field rounded-2xl px-4 py-3" name="countdownLabel" defaultValue={settings.countdownLabel} />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Countdown description</span>
          <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="countdownDescription" defaultValue={settings.countdownDescription} />
        </label>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="mono-label">Operator name</span>
            <input className="field rounded-2xl px-4 py-3" name="operatorName" defaultValue={settings.operatorName} />
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Operator title</span>
            <input className="field rounded-2xl px-4 py-3" name="operatorTitle" defaultValue={settings.operatorTitle} />
          </label>
        </div>
        <label className="block space-y-2">
          <span className="mono-label">Operator bio</span>
          <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="operatorBio" defaultValue={settings.operatorBio} />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Next action copy</span>
          <input className="field rounded-2xl px-4 py-3" name="nextActionCopy" defaultValue={settings.nextActionCopy} />
          <span className="block text-xs text-muted">Use <span className="text-ash">{'{day}'}</span> where the next day number should appear.</span>
        </label>
        <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Save mission settings</button>
      </form>
    </section>
  );
}
