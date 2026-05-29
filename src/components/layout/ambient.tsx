"use client";

import { useEffect, useRef } from "react";

/**
 * Living atmosphere — a rain-covered window onto a distant, rain-blurred city
 * at night, seen from a lone student's desk.
 *
 * Layering (back → front):
 *  - CSS depth: cityscape silhouette, bokeh pools, room/monitor glow, fog,
 *    grid, vignette (cheap, GPU-friendly, defined in globals.css).
 *  - Canvas A "city" (behind the glass): blurred skyline windows + soft bokeh
 *    lights that occasionally flicker, plus faint drifting traffic-light dots.
 *  - Canvas B "glass" (the window itself): distant rain streaks + foreground
 *    droplets that form, grow, occasionally merge, then break and slide down
 *    with a refraction highlight and a thinning trail.
 *
 * Performance guardrails (all preserved + extended):
 *  - device pixel ratio capped at 2
 *  - particle/light budgets scale with viewport area, shrink on small screens
 *  - the rAF loop pauses when the tab is hidden
 *  - prefers-reduced-motion → a single static frame, no loop
 *  - reads live --accent-rgb + --rain-intensity so theming/focus flow through
 */
export function AmbientBackground() {
  const cityRef = useRef<HTMLCanvasElement | null>(null);
  const glassRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cityEl = cityRef.current;
    const glassEl = glassRef.current;
    if (!cityEl || !glassEl) return;
    const cityCtxRaw = cityEl.getContext("2d");
    const glassCtxRaw = glassEl.getContext("2d");
    if (!cityCtxRaw || !glassCtxRaw) return;

    const cityCanvas: HTMLCanvasElement = cityEl;
    const glassCanvas: HTMLCanvasElement = glassEl;
    const cityCtx: CanvasRenderingContext2D = cityCtxRaw;
    const glassCtx: CanvasRenderingContext2D = glassCtxRaw;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    let width = 0;
    let height = 0;

    // Live accent (read from CSS var, refreshed cheaply). Used for a faint warm
    // tint in the room glow + the occasional accent-tinted bokeh.
    let accent: [number, number, number] = [255, 59, 48];
    let rainScale = 1; // 0.2..1.6 driven by --rain-intensity
    let accentReadAt = 0;

    function readVars(now: number) {
      // Throttle getComputedStyle to ~2/s — it's the one expensive call here.
      if (now - accentReadAt < 500) return;
      accentReadAt = now;
      const styles = getComputedStyle(document.documentElement);
      const rawAccent = styles.getPropertyValue("--accent-rgb").trim();
      if (rawAccent) {
        const parts = rawAccent.split(/\s+/).map(Number);
        if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
          accent = [parts[0], parts[1], parts[2]];
        }
      }
      const rawRain = styles.getPropertyValue("--rain-intensity").trim();
      const rainPref = rawRain ? Number(rawRain) : 0.5;
      // Map 0..1 preference to a 0.2..1.6 visual multiplier.
      rainScale = Number.isFinite(rainPref) ? 0.2 + Math.min(1, Math.max(0, rainPref)) * 1.4 : 1;
    }

    // ---- City lights (window grid + bokeh + traffic dots) -----------------
    type Light = { x: number; y: number; r: number; baseAlpha: number; hue: number; flickerAt: number; flickerDur: number; tint: number };
    type Traffic = { x: number; y: number; vx: number; r: number; warm: boolean; alpha: number };
    let lights: Light[] = [];
    let traffic: Traffic[] = [];

    // ---- Glass (rain + droplets) ------------------------------------------
    type Streak = { x: number; y: number; len: number; vy: number; vx: number; alpha: number };
    type Drop = {
      x: number;
      y: number;
      r: number;
      vy: number;
      alpha: number;
      sliding: boolean;
      trail: number;
      grow: number; // forming droplets grow until they reach target r
      targetR: number;
      wobble: number;
    };
    let streaks: Streak[] = [];
    let drops: Drop[] = [];

    function seed() {
      const area = width * height;
      const small = width < 760;

      const lightCount = small ? 26 : Math.min(120, Math.round(area / 14000));
      const horizon = height * 0.58;
      lights = Array.from({ length: lightCount }, () => {
        const y = rand(horizon, height * 0.98);
        // Lights lower on the canvas (nearer) are a touch larger + warmer.
        const depth = (y - horizon) / (height - horizon);
        return {
          x: rand(0, width),
          y,
          r: rand(0.6, 2.2) + depth * 1.4,
          baseAlpha: rand(0.06, 0.22) * (0.5 + depth * 0.8),
          hue: rand(0, 1),
          flickerAt: rand(0, 18),
          flickerDur: 0,
          tint: Math.random() < 0.18 ? 1 : 0, // a few share the accent tint
        };
      });

      const trafficCount = small ? 2 : 5;
      traffic = Array.from({ length: trafficCount }, () => ({
        x: rand(0, width),
        y: rand(height * 0.74, height * 0.95),
        vx: rand(8, 22) * (Math.random() < 0.5 ? 1 : -1),
        r: rand(0.8, 1.6),
        warm: Math.random() < 0.5,
        alpha: rand(0.1, 0.26),
      }));

      const streakCount = small ? 26 : Math.min(80, Math.round(area / 24000));
      const dropCount = small ? 12 : Math.min(52, Math.round(area / 38000));

      streaks = Array.from({ length: streakCount }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        len: rand(9, 26),
        vy: rand(180, 360),
        vx: rand(0.8, 2.2),
        alpha: rand(0.04, 0.16),
      }));

      drops = Array.from({ length: dropCount }, () => makeDrop());
    }

    function makeDrop(atTop = false): Drop {
      const targetR = rand(1.1, 3.4);
      return {
        x: rand(0, width),
        y: atTop ? rand(-20, height * 0.4) : rand(0, height),
        r: rand(0.4, targetR),
        vy: 0,
        alpha: rand(0.06, 0.18),
        sliding: false,
        trail: 0,
        grow: rand(0.02, 0.08),
        targetR,
        wobble: rand(0, Math.PI * 2),
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = cityCanvas.clientWidth;
      height = cityCanvas.clientHeight;
      for (const c of [cityCanvas, glassCanvas]) {
        c.width = Math.floor(width * dpr);
        c.height = Math.floor(height * dpr);
      }
      cityCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      glassCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    // ---- City render -------------------------------------------------------
    function drawCity(dt: number, time: number) {
      cityCtx.clearRect(0, 0, width, height);

      for (const l of lights) {
        // Occasional flicker — most lights are steady, a few stutter briefly.
        l.flickerAt -= dt;
        let alpha = l.baseAlpha;
        if (l.flickerAt <= 0) {
          l.flickerDur = rand(0.06, 0.22);
          l.flickerAt = rand(6, 26);
        }
        if (l.flickerDur > 0) {
          l.flickerDur -= dt;
          alpha *= 0.35 + Math.random() * 0.5;
        }
        // Gentle shared breathing so the skyline is never perfectly still.
        alpha *= 0.85 + 0.15 * Math.sin(time * 0.0006 + l.x * 0.01);

        const warm = l.tint
          ? `${accent[0]}, ${accent[1]}, ${accent[2]}`
          : l.hue < 0.6
            ? "255, 196, 140"
            : "150, 185, 255";
        const grad = cityCtx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 4);
        grad.addColorStop(0, `rgba(${warm}, ${alpha})`);
        grad.addColorStop(1, `rgba(${warm}, 0)`);
        cityCtx.fillStyle = grad;
        cityCtx.beginPath();
        cityCtx.arc(l.x, l.y, l.r * 4, 0, Math.PI * 2);
        cityCtx.fill();
      }

      // Faint drifting traffic-light dots along the lower band.
      for (const t of traffic) {
        t.x += t.vx * dt;
        if (t.x < -10) t.x = width + 10;
        if (t.x > width + 10) t.x = -10;
        const col = t.warm ? "255, 150, 90" : "120, 200, 255";
        const grad = cityCtx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.r * 5);
        grad.addColorStop(0, `rgba(${col}, ${t.alpha})`);
        grad.addColorStop(1, `rgba(${col}, 0)`);
        cityCtx.fillStyle = grad;
        cityCtx.beginPath();
        cityCtx.arc(t.x, t.y, t.r * 5, 0, Math.PI * 2);
        cityCtx.fill();
      }
    }

    // ---- Glass render ------------------------------------------------------
    function drawGlass(dt: number, time: number) {
      glassCtx.clearRect(0, 0, width, height);

      // Distant rain — thin, faint, slightly wind-angled streaks.
      glassCtx.strokeStyle = "rgb(214, 224, 240)";
      glassCtx.lineWidth = 1;
      for (const s of streaks) {
        s.y += s.vy * dt * rainScale;
        s.x += s.vx * dt * 6;
        if (s.y - s.len > height || s.x > width + 10) {
          s.y = -rand(0, height * 0.4);
          s.x = rand(-10, width);
        }
        glassCtx.globalAlpha = s.alpha * Math.min(1, rainScale);
        glassCtx.beginPath();
        glassCtx.moveTo(s.x, s.y);
        glassCtx.lineTo(s.x + s.vx * 2.4, s.y + s.len);
        glassCtx.stroke();
      }

      // Foreground droplets — form, grow, merge, then break free + slide.
      for (let i = 0; i < drops.length; i += 1) {
        const d = drops[i];

        // Grow while resting until it reaches its target size.
        if (!d.sliding && d.r < d.targetR) {
          d.r = Math.min(d.targetR, d.r + d.grow * dt * 12);
        }

        // Heavier, fully-grown droplets are more likely to start running.
        const startChance = 0.0009 + (d.r / d.targetR) * 0.0016;
        if (!d.sliding && d.r >= d.targetR * 0.92 && Math.random() < startChance) {
          d.sliding = true;
          d.vy = rand(14, 46) * (0.6 + d.r / 3);
        }

        if (d.sliding) {
          d.vy += 26 * dt; // gentle gravity, capped below
          d.vy = Math.min(d.vy, 150);
          d.y += d.vy * dt;
          d.wobble += dt * 6;
          d.x += Math.sin(d.wobble) * 0.25; // slight meander
          d.trail = Math.min(d.trail + d.vy * dt, 120);

          // Merge: a sliding drop that overtakes a nearby resting drop absorbs
          // it, growing slightly and leaving the smaller one to respawn.
          for (let j = 0; j < drops.length; j += 1) {
            if (j === i) continue;
            const o = drops[j];
            if (o.sliding) continue;
            const dx = o.x - d.x;
            const dy = o.y - d.y;
            if (Math.abs(dx) < d.r + o.r + 1.5 && dy > -2 && dy < d.r + 10) {
              d.r = Math.min(4.4, Math.hypot(d.r, o.r));
              d.alpha = Math.min(0.22, d.alpha + o.alpha * 0.4);
              d.vy += 8;
              Object.assign(o, makeDrop(true));
            }
          }

          if (d.y > height + 14) {
            Object.assign(d, makeDrop(true));
          }
        }

        // Trail — a thinning refraction streak left behind a running droplet.
        if (d.trail > 1) {
          const grad = glassCtx.createLinearGradient(d.x, d.y - d.trail, d.x, d.y);
          grad.addColorStop(0, "rgba(198, 210, 230, 0)");
          grad.addColorStop(1, `rgba(198, 210, 230, ${d.alpha * 0.4})`);
          glassCtx.strokeStyle = grad;
          glassCtx.lineWidth = Math.max(0.6, d.r * 0.7);
          glassCtx.beginPath();
          glassCtx.moveTo(d.x, d.y - d.trail);
          glassCtx.lineTo(d.x, d.y);
          glassCtx.stroke();
        }

        // Droplet body — a soft lens with a darker rim + bright refraction hi.
        const body = glassCtx.createRadialGradient(
          d.x - d.r * 0.3,
          d.y - d.r * 0.3,
          d.r * 0.1,
          d.x,
          d.y,
          d.r,
        );
        body.addColorStop(0, `rgba(232, 240, 252, ${d.alpha + 0.05})`);
        body.addColorStop(0.7, `rgba(170, 185, 210, ${d.alpha * 0.5})`);
        body.addColorStop(1, `rgba(120, 135, 160, ${d.alpha * 0.18})`);
        glassCtx.fillStyle = body;
        glassCtx.beginPath();
        glassCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        glassCtx.fill();

        // Crisp refraction highlight.
        glassCtx.globalAlpha = Math.min(1, d.alpha * 4.5);
        glassCtx.fillStyle = "rgba(255, 255, 255, 0.95)";
        glassCtx.beginPath();
        glassCtx.arc(d.x - d.r * 0.32, d.y - d.r * 0.34, Math.max(0.35, d.r * 0.28), 0, Math.PI * 2);
        glassCtx.fill();
        glassCtx.globalAlpha = 1;
      }

      void time;
    }

    function drawAll(dt: number, now: number) {
      readVars(now);
      drawCity(dt, now);
      drawGlass(dt, now);
    }

    resize();

    let raf = 0;
    let last = performance.now();

    const startLoop = () => {
      last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        drawAll(dt, now);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      drawAll(0, performance.now()); // single static frame, no loop
    } else {
      startLoop();
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        startLoop();
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
      <canvas ref={cityRef} className="ambient-canvas absolute inset-0 h-full w-full" style={{ opacity: 0.85 }} />
      <div className="ambient-bokeh ambient-bokeh-1" />
      <div className="ambient-bokeh ambient-bokeh-2" />
      <div className="ambient-bokeh ambient-bokeh-3" />
      <div className="ambient-monitor-glow" />
      <div className="ambient-room-glow" />
      <div className="ambient-flash" />
      <canvas ref={glassRef} className="ambient-canvas absolute inset-0 h-full w-full" />
      <div className="ambient-fog" />
      <div className="ambient-grid" />
      <div className="ambient-vignette" />
    </div>
  );
}
