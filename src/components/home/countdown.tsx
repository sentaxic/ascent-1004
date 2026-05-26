"use client";

import { useEffect, useMemo, useState } from "react";

import type { MissionSettings } from "@/lib/types";

type CountdownParts = {
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function diffParts(target: Date): CountdownParts {
  const diff = Math.max(target.getTime() - Date.now(), 0);
  const totalDays = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { totalDays, hours, minutes, seconds };
}

function formatTarget(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone,
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function clock(value: number | undefined) {
  return String(value ?? 0).padStart(2, "0");
}

export function Countdown({ settings }: { settings: MissionSettings }) {
  const target = useMemo(() => new Date(settings.applicationDeadline), [settings.applicationDeadline]);
  const decision = useMemo(() => new Date(settings.decisionHorizon), [settings.decisionHorizon]);
  const [parts, setParts] = useState<CountdownParts | null>(null);
  const [decisionParts, setDecisionParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const tick = () => {
      setParts(diffParts(target));
      setDecisionParts(diffParts(decision));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [decision, target]);

  return (
    <section className="terminal-panel reveal overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:col-span-8" style={{ animationDelay: "80ms" }}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-redline/80 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label text-redline">{settings.countdownLabel}</p>
          <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.09em] text-ash sm:text-7xl lg:text-8xl">
            {parts ? parts.totalDays.toLocaleString() : "..."}
            <span className="ml-3 align-middle text-lg tracking-[-0.04em] text-muted sm:text-2xl">days</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
            {settings.countdownDescription}
          </p>
        </div>
        <div className="rounded-2xl border border-redline/25 bg-redline/[0.06] px-4 py-3 text-left sm:text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-redline">live clock</p>
          <p className="mt-2 text-2xl text-ash">
            {clock(parts?.hours)}:{clock(parts?.minutes)}:{clock(parts?.seconds)}
          </p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-muted">{settings.missionTimeZone}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["MIT deadline", formatTarget(target, settings.missionTimeZone)],
          ["Hours window", clock(parts?.hours)],
          ["Minutes", clock(parts?.minutes)],
          ["Pi horizon", decisionParts ? `${decisionParts.totalDays.toLocaleString()}d` : "..."],
        ].map(([label, value]) => (
          <div key={label} className="soft-card rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:border-redline/40 hover:bg-redline/[0.045]">
            <p className="mono-label">{label}</p>
            <p className="mt-2 text-xl text-ash sm:text-2xl">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
