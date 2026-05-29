"use client";

import { useEffect } from "react";

import { useCalmMotion } from "@/components/motion/use-reduced-motion";

/**
 * Lightweight, NON-hijacking scroll feel. We deliberately do NOT override the
 * scroll position (that breaks native scrolling, keyboard nav, focus, and
 * accessibility). Instead we publish a smoothed scroll *velocity* to a CSS
 * custom property (--scroll-velocity, 0..1) that atmosphere/decoration layers
 * can read for a subtle motion-blur / lean — momentum without interception.
 *
 * The heavy lifting of the "premium" feel is done by <Parallax> + <Reveal>;
 * this just adds a faint global responsiveness. Mounts once in the layout.
 */
export function SmoothScroll() {
  const calm = useCalmMotion();

  useEffect(() => {
    if (calm) {
      document.documentElement.style.setProperty("--scroll-velocity", "0");
      return;
    }

    let last = window.scrollY;
    let velocity = 0;
    let smoothed = 0;
    let raf = 0;
    let idleFrames = 0;

    const onScroll = () => {
      const now = window.scrollY;
      velocity = Math.min(1, Math.abs(now - last) / 60);
      last = now;
      idleFrames = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      smoothed += (velocity - smoothed) * 0.12;
      velocity *= 0.9;
      document.documentElement.style.setProperty("--scroll-velocity", smoothed.toFixed(3));
      // Stop the loop once movement settles to spare the main thread.
      if (smoothed < 0.002 && velocity < 0.002) {
        idleFrames += 1;
        if (idleFrames > 6) {
          document.documentElement.style.setProperty("--scroll-velocity", "0");
          raf = 0;
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [calm]);

  return null;
}
