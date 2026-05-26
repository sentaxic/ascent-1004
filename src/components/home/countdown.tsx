"use client";

import { useEffect, useMemo, useState } from "react";

import { siteConfig } from "@/lib/config";

function diffParts(target: Date) {
  const diff = Math.max(target.getTime() - Date.now(), 0);
  const totalDays = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { totalDays, hours, minutes, seconds };
}

export function Countdown() {
  const target = useMemo(() => new Date(siteConfig.applicationDeadline), []);
  const decision = useMemo(() => new Date(siteConfig.decisionHorizon), []);
  const [parts, setParts] = useState(() => diffParts(target));
  const [decisionParts, setDecisionParts] = useState(() => diffParts(decision));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setParts(diffParts(target));
      setDecisionParts(diffParts(decision));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [decision, target]);

  return (
    <section className="terminal-panel reveal overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:col-span-8" style={{ animationDelay: "80ms" }}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-redline/80 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label text-redline">primary countdown / MIT application horizon</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.08em] text-ash sm:text-6xl lg:text-7xl">
            {parts.totalDays.toLocaleString()} days
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            10th grade long-range mission. Default target is Jan 5, 2029, with Pi Day 2029 tracked as the symbolic decision horizon.
          </p>
        </div>
        <div className="rounded-2xl border border-redline/25 bg-redline/[0.06] px-4 py-3 text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-redline">live clock</p>
          <p className="mt-2 text-2xl text-ash">
            {String(parts.hours).padStart(2, "0")}:{String(parts.minutes).padStart(2, "0")}:{String(parts.seconds).padStart(2, "0")}
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {[
          ["Days", parts.totalDays.toLocaleString()],
          ["Hours", String(parts.hours).padStart(2, "0")],
          ["Minutes", String(parts.minutes).padStart(2, "0")],
          ["Pi horizon", `${decisionParts.totalDays.toLocaleString()}d`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/35 p-4 transition duration-300 hover:-translate-y-1 hover:border-redline/40 hover:bg-redline/[0.045]">
            <p className="mono-label">{label}</p>
            <p className="mt-2 text-2xl text-ash">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
