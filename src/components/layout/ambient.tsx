export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full border border-redline/10 bg-redline/[0.035] blur-3xl [animation:ambient-drift_18s_ease-in-out_infinite_alternate]" />
      <div className="absolute bottom-[-16rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full border border-amber/10 bg-amber/[0.03] blur-3xl [animation:ambient-drift_22s_ease-in-out_infinite_alternate-reverse]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:68px_68px] opacity-30" />
    </div>
  );
}
