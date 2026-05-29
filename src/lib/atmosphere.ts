/**
 * Atmosphere theming tokens — the single source of truth for per-section
 * accent + ambient tint. The ThemeProvider reads these and writes CSS custom
 * properties on <html> (data-atmosphere=...), so every accent token across the
 * app (buttons, hairlines, glow, cursor, canvas pools) shifts in unison.
 *
 * Default = mission / red.
 */

export type AtmosphereName =
  | "mission"
  | "physics"
  | "devlog"
  | "gym"
  | "writing"
  | "philosophy"
  | "failure";

export type AtmosphereToken = {
  /** Space-separated RGB channels, e.g. "255 59 48" — fed to rgb(var()/a). */
  accentRgb: string;
  /** Warm ambient pool (desk/room glow + warm bokeh). */
  warmRgb: string;
  /** Cool ambient pool (monitor glow + cool bokeh). */
  coolRgb: string;
  /** Overall atmosphere brightness multiplier (failure dims the room). */
  intensity: number;
};

export const ATMOSPHERES: Record<AtmosphereName, AtmosphereToken> = {
  // mission — restrained red, the home accent.
  mission: { accentRgb: "255 59 48", warmRgb: "255 120 90", coolRgb: "90 150 255", intensity: 1 },
  // physics — cool blue, clinical and calm.
  physics: { accentRgb: "90 167 255", warmRgb: "120 140 200", coolRgb: "90 167 255", intensity: 1 },
  // devlog — terminal green.
  devlog: { accentRgb: "128 214 143", warmRgb: "150 200 150", coolRgb: "90 200 170", intensity: 1 },
  // gym — warm orange, effortful.
  gym: { accentRgb: "249 115 22", warmRgb: "249 130 60", coolRgb: "180 120 90", intensity: 1.05 },
  // writing — soft monochrome, warm off-white.
  writing: { accentRgb: "210 200 184", warmRgb: "200 185 160", coolRgb: "150 160 180", intensity: 0.85 },
  // philosophy — soft monochrome, slightly cooler than writing.
  philosophy: { accentRgb: "196 192 200", warmRgb: "170 165 175", coolRgb: "140 150 175", intensity: 0.8 },
  // failure — darker, the room loses light.
  failure: { accentRgb: "167 36 32", warmRgb: "120 50 45", coolRgb: "70 80 110", intensity: 0.62 },
};

export const DEFAULT_ATMOSPHERE: AtmosphereName = "mission";

export function isAtmosphereName(value: string): value is AtmosphereName {
  return value in ATMOSPHERES;
}

/**
 * Maps a route pathname to its atmosphere. Page builders can rely on this for
 * automatic theming, or override explicitly with <Atmosphere>/useAtmosphere.
 */
export function atmosphereForPath(pathname: string): AtmosphereName {
  if (pathname.startsWith("/physics")) return "physics";
  if (pathname.startsWith("/devlog")) return "devlog";
  if (pathname.startsWith("/gym")) return "gym";
  if (pathname.startsWith("/writing")) return "writing";
  if (pathname.startsWith("/philosophy")) return "philosophy";
  if (pathname.startsWith("/failure")) return "failure";
  return DEFAULT_ATMOSPHERE;
}
