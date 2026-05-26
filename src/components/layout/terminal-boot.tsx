"use client";

import { useEffect, useState } from "react";

export function TerminalBoot() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-void text-ash">
      <div className="w-[min(520px,calc(100vw-32px))] border border-redline/30 bg-black p-5 shadow-[0_0_60px_rgba(255,59,48,0.12)]">
        <p className="text-xs uppercase tracking-[0.2em] text-redline">boot / ascent-1004</p>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p>&gt; loading physics log</p>
          <p>&gt; syncing streak telemetry</p>
          <p>&gt; opening public mission archive<span className="[animation:boot-caret_1s_steps(2,start)_infinite]">_</span></p>
        </div>
      </div>
    </div>
  );
}
