"use client";

import { useEffect, useRef } from "react";

/**
 * Primary environmental backdrop: a real rain-on-glass video loop, dimmed,
 * blurred, and accent-graded so it reads as deep atmosphere behind everything
 * (sits at -z-20, beneath the canvas rain/city at -z-10). It supports the
 * experience, never overpowers it.
 *
 * Guards: muted + playsInline + loop autoplay (works on iOS); pauses when the
 * tab is hidden; under prefers-reduced-motion the video stays paused and the
 * poster frame carries the mood.
 */
export function VideoBackground() {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      video.pause();
      return; // poster frame only
    }

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();

    const onVisibility = () => {
      if (document.hidden) video.pause();
      else tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div aria-hidden className="video-bg pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <video
        ref={ref}
        className="video-bg-media"
        poster="/video/rain-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/video/rain-loop.mp4" type="video/mp4" />
      </video>
      <div className="video-bg-grade" />
      <div className="video-bg-scrim" />
    </div>
  );
}
