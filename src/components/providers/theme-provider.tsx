"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ATMOSPHERES,
  DEFAULT_ATMOSPHERE,
  isAtmosphereName,
  type AtmosphereName,
} from "@/lib/atmosphere";

/**
 * Global environment state shared across the shell:
 *  - atmosphere: the active per-section accent/tint (writes CSS vars on <html>)
 *  - focusMode: calms motion + brightness (cursor/motion/audio all read this)
 *  - rainIntensity: 0..1, written by the audio panel, read by the canvas
 *
 * Everything here is client-side; the provider mounts once in the layout and
 * exposes a tiny API page builders compose against.
 */

type ThemeContextValue = {
  atmosphere: AtmosphereName;
  setAtmosphere: (name: AtmosphereName) => void;
  resetAtmosphere: () => void;
  focusMode: boolean;
  setFocusMode: (on: boolean) => void;
  toggleFocusMode: () => void;
  rainIntensity: number;
  setRainIntensity: (value: number) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const FOCUS_KEY = "ascent:focus-mode";
const RAIN_KEY = "ascent:rain-intensity";

function applyAtmosphereVars(name: AtmosphereName) {
  const token = ATMOSPHERES[name] ?? ATMOSPHERES[DEFAULT_ATMOSPHERE];
  const root = document.documentElement;
  root.dataset.atmosphere = name;
  root.style.setProperty("--accent-rgb", token.accentRgb);
  root.style.setProperty("--atmo-warm", token.warmRgb);
  root.style.setProperty("--atmo-cool", token.coolRgb);
  root.style.setProperty("--atmo-intensity", String(token.intensity));
}

export function ThemeProvider({
  children,
  defaultAtmosphere = DEFAULT_ATMOSPHERE,
}: {
  children: ReactNode;
  defaultAtmosphere?: AtmosphereName;
}) {
  const [atmosphere, setAtmosphereState] = useState<AtmosphereName>(defaultAtmosphere);
  const [focusMode, setFocusModeState] = useState(false);
  const [rainIntensity, setRainIntensityState] = useState(0.5);
  // Stack of explicit overrides so nested <Atmosphere> sections unwind cleanly.
  const baseRef = useRef<AtmosphereName>(defaultAtmosphere);

  // Hydrate persisted preferences once.
  useEffect(() => {
    try {
      const storedFocus = localStorage.getItem(FOCUS_KEY) === "1";
      if (storedFocus) setFocusModeState(true);
      const storedRain = localStorage.getItem(RAIN_KEY);
      if (storedRain !== null) {
        const value = Number(storedRain);
        if (Number.isFinite(value)) setRainIntensityState(Math.min(1, Math.max(0, value)));
      }
    } catch {
      /* private mode — defaults are fine */
    }
  }, []);

  // Reflect atmosphere → CSS vars.
  useEffect(() => {
    applyAtmosphereVars(atmosphere);
  }, [atmosphere]);

  // Reflect focus mode → <html data-focus> + persistence.
  useEffect(() => {
    document.documentElement.dataset.focus = focusMode ? "on" : "off";
    try {
      localStorage.setItem(FOCUS_KEY, focusMode ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [focusMode]);

  // Persist rain intensity (canvas reads the CSS var too for cheap access).
  useEffect(() => {
    document.documentElement.style.setProperty("--rain-intensity", String(rainIntensity));
    try {
      localStorage.setItem(RAIN_KEY, String(rainIntensity));
    } catch {
      /* ignore */
    }
  }, [rainIntensity]);

  const setAtmosphere = useCallback((name: AtmosphereName) => {
    baseRef.current = isAtmosphereName(name) ? name : DEFAULT_ATMOSPHERE;
    setAtmosphereState(baseRef.current);
  }, []);

  const resetAtmosphere = useCallback(() => {
    baseRef.current = defaultAtmosphere;
    setAtmosphereState(defaultAtmosphere);
  }, [defaultAtmosphere]);

  const setFocusMode = useCallback((on: boolean) => setFocusModeState(on), []);
  const toggleFocusMode = useCallback(() => setFocusModeState((v) => !v), []);
  const setRainIntensity = useCallback(
    (value: number) => setRainIntensityState(Math.min(1, Math.max(0, value))),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      atmosphere,
      setAtmosphere,
      resetAtmosphere,
      focusMode,
      setFocusMode,
      toggleFocusMode,
      rainIntensity,
      setRainIntensity,
    }),
    [atmosphere, setAtmosphere, resetAtmosphere, focusMode, setFocusMode, toggleFocusMode, rainIntensity, setRainIntensity],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Access + control the live environment. Safe to call outside the provider —
 * returns inert defaults so isolated component previews never crash.
 */
export function useAtmosphere(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    atmosphere: DEFAULT_ATMOSPHERE,
    setAtmosphere: () => {},
    resetAtmosphere: () => {},
    focusMode: false,
    setFocusMode: () => {},
    toggleFocusMode: () => {},
    rainIntensity: 0.5,
    setRainIntensity: () => {},
  };
}
