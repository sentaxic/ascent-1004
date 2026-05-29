"use client";

import { useEffect, useRef } from "react";

/**
 * Living atmosphere: a rain-covered window onto a distant futuristic city.
 * CSS layers carry the cheap, static depth (skyline, bokeh, fog, vignette);
 * a single 2D canvas adds distant rain streaks + glass droplets that slide.
 *
 * Performance guardrails:
 *  - particle budget scales with viewport area and shrinks on small screens
 *  - device pixel ratio capped at 2
 *  - the rAF loop pauses when the tab is hidden
 *  - prefers-reduced-motion → one static frame, no loop
 */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d");
    if (!context) return;
    // Bind to non-null consts so the narrowing holds inside the nested draw/resize closures.
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    let width = 0;
    let height = 0;

    type Streak = { x: number; y: number; len: number; vy: number; alpha: number };
    type Drop = { x: number; y: number; r: number; vy: number; alpha: number; sliding: boolean; trail: number };
    let streaks: Streak[] = [];
    let drops: Drop[] = [];

    function seed() {
      const area = width * height;
      const small = width < 760;
      const streakCount = small ? 24 : Math.min(72, Math.round(area / 26000));
      const dropCount = small ? 10 : Math.min(44, Math.round(area / 42000));

      streaks = Array.from({ length: streakCount }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        len: rand(9, 24),
        vy: rand(170, 320),
        alpha: rand(0.04, 0.15),
      }));

      drops = Array.from({ length: dropCount }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(1.1, 2.7),
        vy: 0,
        alpha: rand(0.05, 0.16),
        sliding: false,
        trail: 0,
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function draw(dt: number) {
      ctx.clearRect(0, 0, width, height);

      // distant rain — thin, faint, slightly angled streaks
      ctx.strokeStyle = "rgb(214, 224, 240)";
      ctx.lineWidth = 1;
      for (const s of streaks) {
        s.y += s.vy * dt;
        if (s.y - s.len > height) {
          s.y = -rand(0, height * 0.4);
          s.x = rand(0, width);
        }
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + 1.4, s.y + s.len);
        ctx.stroke();
      }

      // foreground glass droplets — mostly still, a few slowly run down
      for (const d of drops) {
        if (!d.sliding && Math.random() < 0.0016) {
          d.sliding = true;
          d.vy = rand(12, 38);
        }
        if (d.sliding) {
          d.y += d.vy * dt;
          d.trail = Math.min(d.trail + d.vy * dt, 78);
          if (d.y > height + 12) {
            d.x = rand(0, width);
            d.y = rand(-20, height * 0.5);
            d.vy = 0;
            d.sliding = false;
            d.trail = 0;
            d.r = rand(1.1, 2.7);
          }
        }

        if (d.trail > 1) {
          const grad = ctx.createLinearGradient(d.x, d.y - d.trail, d.x, d.y);
          grad.addColorStop(0, "rgba(198, 210, 230, 0)");
          grad.addColorStop(1, `rgba(198, 210, 230, ${d.alpha * 0.45})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(0.6, d.r * 0.7);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - d.trail);
          ctx.lineTo(d.x, d.y);
          ctx.stroke();
        }

        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = "rgba(223, 231, 243, 0.92)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = d.alpha * 0.85;
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, Math.max(0.4, d.r * 0.32), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    resize();

    let raf = 0;
    let last = performance.now();

    if (reduceMotion) {
      draw(0); // single static frame
    } else {
      const loop = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        draw(dt);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        last = performance.now();
        raf = requestAnimationFrame(function loop(now) {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          draw(dt);
          raf = requestAnimationFrame(loop);
        });
      }
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 160);
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="ambient-root pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-city" />
      <div className="ambient-bokeh ambient-bokeh-1" />
      <div className="ambient-bokeh ambient-bokeh-2" />
      <div className="ambient-bokeh ambient-bokeh-3" />
      <div className="ambient-flash" />
      <canvas ref={canvasRef} className="ambient-canvas absolute inset-0 h-full w-full" />
      <div className="ambient-fog" />
      <div className="ambient-grid" />
      <div className="ambient-vignette" />
    </div>
  );
}
