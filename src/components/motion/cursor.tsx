"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor — a soft glowing accent dot that tracks the pointer 1:1, plus a
 * trailing ring that eases behind it and scales/brightens over interactive
 * elements. Tinted by the live --accent-rgb (set in globals.css), so it shifts
 * with the section atmosphere.
 *
 * Guards:
 *  - hidden on touch / coarse pointers (also enforced in CSS)
 *  - disabled under prefers-reduced-motion (no custom cursor, native restored)
 *  - the rAF loop self-stops; listeners clean up on unmount
 *
 * Interactive detection: anything matching a/button/[role=button]/input/etc OR
 * carrying data-cursor="active" (e.g. <MagneticButton>) triggers the ring.
 */
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="active"]';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduceMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let visible = false;
    let raf = 0;

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      if (!visible) {
        visible = true;
        dot.classList.remove("is-hidden");
        ring.classList.remove("is-hidden");
      }
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.(INTERACTIVE)) {
        ring.classList.add("is-active");
      } else {
        ring.classList.remove("is-active");
      }
    };

    const onLeave = () => {
      visible = false;
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
    };
    const onDown = () => ring.classList.add("is-active");
    const onUp = () => {
      // Recompute from the element currently under the pointer.
      const el = document.elementFromPoint(mouseX, mouseY);
      if (!el?.closest?.(INTERACTIVE)) ring.classList.remove("is-active");
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot is-hidden" aria-hidden />
      <div ref={ringRef} className="cursor-ring is-hidden" aria-hidden />
    </>
  );
}
