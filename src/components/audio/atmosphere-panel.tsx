"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { useFocusAudio } from "@/components/audio/use-focus-audio";
import { useAtmosphere } from "@/components/providers/theme-provider";
import { AUDIO_LAYERS } from "@/lib/audio";

function fillStyle(value: number) {
  return { "--fill": `${Math.round(value * 100)}%` } as React.CSSProperties;
}

function Slider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[0.66rem] uppercase tracking-[0.2em] text-muted">
        <span>{label}</span>
        <span className="text-text/70 tabular-nums">{Math.round(value * 100)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="audio-slider mt-2"
        style={fillStyle(value)}
        aria-label={label}
      />
      {hint ? <span className="mt-1 block text-[0.6rem] leading-4 text-faint">{hint}</span> : null}
    </label>
  );
}

export function AtmospherePanel() {
  const [open, setOpen] = useState(false);
  const audio = useFocusAudio();
  const { rainIntensity, setRainIntensity, focusMode, toggleFocusMode } = useAtmosphere();

  return (
    <div className="fixed bottom-5 right-5 z-[55] flex flex-col items-end gap-3 print:hidden">
      <AnimatePresence>
        {open ? (
          <motion.section
            key="panel"
            initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="glass glass-accent-border atmosphere-panel w-[min(20rem,calc(100vw-2.5rem))] rounded-3xl p-5"
            aria-label="Focus environment controls"
          >
            <header className="flex items-center justify-between">
              <div>
                <p className="eyebrow-plain text-[0.6rem]">Focus environment</p>
                <h2 className="mt-1 text-lg tracking-[-0.03em] text-ash">Atmosphere</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close atmosphere panel"
                className="grid size-8 place-items-center rounded-full border border-white/10 text-muted transition hover:border-accent-line hover:text-ash"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div className="mt-5 hairline" />

            {/* Sound */}
            <div className="mt-5 space-y-4">
              <button
                onClick={audio.toggle}
                className="audio-trigger flex w-full items-center justify-between rounded-2xl px-4 py-3"
                data-active={audio.playing}
                aria-pressed={audio.playing}
              >
                <span className="flex items-center gap-3 text-xs uppercase tracking-[0.18em]">
                  {audio.playing ? (
                    <span className="flex h-4 items-end gap-[3px]" aria-hidden>
                      <span className="eq-bar h-2" />
                      <span className="eq-bar h-4" />
                      <span className="eq-bar h-3" />
                    </span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
                    </svg>
                  )}
                  {audio.playing ? "Playing" : "Begin ambience"}
                </span>
                <span className="text-[0.6rem] text-faint">{audio.playing ? "tap to pause" : "lo-fi · rain"}</span>
              </button>

              <Slider label="Master" value={audio.master} onChange={audio.setMaster} />
              {AUDIO_LAYERS.map((layer) => (
                <Slider
                  key={layer.id}
                  label={layer.label}
                  value={audio.volumes[layer.id] ?? 0}
                  onChange={(v) => audio.setLayer(layer.id, v)}
                />
              ))}
            </div>

            <div className="mt-5 hairline" />

            {/* Environment */}
            <div className="mt-5 space-y-4">
              <Slider
                label="Rain intensity"
                value={rainIntensity}
                onChange={setRainIntensity}
                hint="Density of rain on the glass."
              />
              <button
                onClick={toggleFocusMode}
                className="audio-trigger flex w-full items-center justify-between rounded-2xl px-4 py-3"
                data-active={focusMode}
                aria-pressed={focusMode}
              >
                <span className="text-xs uppercase tracking-[0.18em]">Focus mode</span>
                <span className="text-[0.6rem] text-faint">{focusMode ? "on — room dimmed" : "off"}</span>
              </button>
            </div>

            <p className="mt-5 text-[0.58rem] leading-4 text-faint">
              Add <span className="text-muted">rain.mp3 · city.mp3 · room.mp3</span> to{" "}
              <span className="text-muted">/audio</span> to layer more of the environment.
            </p>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="audio-trigger rounded-full px-4 py-3"
        data-active={open || audio.playing}
        aria-expanded={open}
        aria-label="Open atmosphere controls"
      >
        {audio.playing ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden>
            <span className="eq-bar h-2" />
            <span className="eq-bar h-4" />
            <span className="eq-bar h-3" />
          </span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 6v4M6 3v10M10 5v6M14 7v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
        <span className="hidden text-[0.62rem] uppercase tracking-[0.2em] sm:inline">Atmosphere</span>
      </button>
    </div>
  );
}
