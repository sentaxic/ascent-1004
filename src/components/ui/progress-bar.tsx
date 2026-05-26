export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div className="space-y-2">
      {label ? <div className="flex justify-between text-xs uppercase tracking-[0.18em] text-muted"><span>{label}</span><span>{clamped}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-redline via-amber to-ash shadow-[0_0_24px_rgba(255,59,48,0.25)] transition-all duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
