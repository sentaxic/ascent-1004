"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
  "INITIALIZING ASCENT...",
  "CONNECTING TO ARCHIVE...",
  "SYNCING MISSION LOGS...",
  "LOADING COMMAND CENTER...",
  "VERIFYING SYSTEM STATUS...",
  "PREPARING ENVIRONMENT...",
  "MISSION CONTROL ONLINE.",
];

const INTRO_KEY = "ascent:intro-seen";

type Phase = "booting" | "exiting" | "done";

/**
 * Cinematic boot/loading overlay. It sits above the page (which renders behind
 * it) and dismisses on an adaptive schedule:
 *  - progress eases toward 90% over a minimum duration, then completes once the
 *    window has finished loading — honest pacing, never a fake wait
 *  - first visit gets the full sequence; afterwards a short transition
 *    (localStorage), so it never becomes repetitive
 *  - prefers-reduced-motion → a brief fade, no animation
 */
export function TerminalBoot() {
  const [phase, setPhase] = useState<Phase>("booting");
  const [progress, setProgress] = useState(0);
  const [full, setFull] = useState(true);

  const progressRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let seenIntro = false;
    try {
      seenIntro = localStorage.getItem(INTRO_KEY) === "1";
    } catch {
      seenIntro = false;
    }
    const isFull = !seenIntro;
    setFull(isFull);

    const markSeen = () => {
      try {
        localStorage.setItem(INTRO_KEY, "1");
      } catch {
        /* private mode — fine, just replays the intro */
      }
    };

    if (reduceMotion) {
      setProgress(100);
      markSeen();
      const t = window.setTimeout(() => setPhase("done"), 240);
      return () => window.clearTimeout(t);
    }

    const minDuration = isFull ? 3400 : 1000; // ms to climb to ~90%
    const exitHold = isFull ? 520 : 240; // pause on 100% before fading
    const exitFade = isFull ? 820 : 520; // fade-out length

    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad);

    const start = performance.now();
    let raf = 0;
    let exitTimer = 0;
    let doneTimer = 0;
    let finishing = false;

    const tick = (now: number) => {
      const elapsed = now - start;
      const target = Math.min(90, (elapsed / minDuration) * 90);
      const current = progressRef.current + (target - progressRef.current) * 0.12;
      progressRef.current = current;
      setProgress(current);

      const minMet = elapsed >= minDuration * (isFull ? 0.7 : 0.45);
      if (loaded && minMet && !finishing) {
        finishing = true;
        progressRef.current = 100;
        setProgress(100);
        markSeen();
        exitTimer = window.setTimeout(() => setPhase("exiting"), exitHold);
        doneTimer = window.setTimeout(() => setPhase("done"), exitHold + exitFade);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (phase === "done") return null;

  const pct = Math.round(progress);
  const msgIndex = Math.min(MESSAGES.length - 1, Math.floor((progress / 100) * MESSAGES.length));

  return (
    <div className={`boot-overlay ${phase === "exiting" ? "boot-overlay-exit" : ""}`} role="status" aria-live="polite">
      <div className="boot-atmosphere" aria-hidden />
      <div className={`boot-core ${full ? "boot-core-full" : ""}`}>
        <p className="boot-eyebrow">mission control</p>
        <h1 className="boot-logo">
          ASCENT<span className="boot-logo-dash">-</span>1004
        </h1>
        <p key={msgIndex} className="boot-message">{MESSAGES[msgIndex]}</p>

        <div className="boot-progress" aria-hidden>
          <div className="boot-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="boot-readout" aria-hidden>
          <span>SYSTEM</span>
          <span>{String(pct).padStart(3, "0")}%</span>
        </div>
      </div>
      <span className="sr-only">Loading ASCENT-1004, {pct} percent.</span>
    </div>
  );
}
