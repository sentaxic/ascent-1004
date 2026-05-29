/**
 * Focus-Environment audio engine.
 *
 * A tiny framework-agnostic singleton that layers looping ambient tracks with
 * independent volumes, a master, and smooth fades. State is published through a
 * useSyncExternalStore-compatible subscribe/getSnapshot pair (see
 * components/audio/use-focus-audio.ts).
 *
 * Only layers whose files actually exist in /public/audio are registered, so
 * there are no 404s. Drop more files in and add entries here to expand the
 * environment (rain.mp3 / city.mp3 / room.mp3 …) — the panel renders whatever
 * is registered. Playback is gesture-gated (the panel's toggle is the gesture),
 * so autoplay policies are never violated.
 */

export type AudioLayerConfig = { id: string; label: string; src: string; defaultVolume: number };

export const AUDIO_LAYERS: AudioLayerConfig[] = [
  { id: "lofi", label: "Lo-Fi — 3am", src: "/audio/lofi.mp3", defaultVolume: 0.6 },
  // To expand the focus environment, add files to public/audio and list them:
  // { id: "rain", label: "Rain", src: "/audio/rain.mp3", defaultVolume: 0.5 },
  // { id: "city", label: "City", src: "/audio/city.mp3", defaultVolume: 0.35 },
  // { id: "room", label: "Room", src: "/audio/room.mp3", defaultVolume: 0.3 },
];

export type AudioSnapshot = {
  ready: boolean;
  playing: boolean;
  master: number;
  volumes: Record<string, number>;
};

const SERVER_SNAPSHOT: AudioSnapshot = { ready: false, playing: false, master: 0.7, volumes: {} };

const clamp = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
const MASTER_KEY = "ascent:audio-master";
const layerKey = (id: string) => `ascent:audio:${id}`;

class FocusAudioEngine {
  private elements = new Map<string, HTMLAudioElement>();
  private listeners = new Set<() => void>();
  private fades = new Map<string, number>();
  private snap: AudioSnapshot = SERVER_SNAPSHOT;
  private started = false;

  init() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;

    let master = 0.7;
    try {
      const m = Number(localStorage.getItem(MASTER_KEY));
      if (Number.isFinite(m) && m > 0) master = clamp(m);
    } catch {
      /* private mode */
    }

    const volumes: Record<string, number> = {};
    for (const cfg of AUDIO_LAYERS) {
      let v = cfg.defaultVolume;
      try {
        const stored = localStorage.getItem(layerKey(cfg.id));
        if (stored !== null && Number.isFinite(Number(stored))) v = clamp(Number(stored));
      } catch {
        /* ignore */
      }
      volumes[cfg.id] = v;

      const el = new Audio();
      el.src = cfg.src;
      el.loop = true;
      el.preload = "auto";
      el.volume = 0; // silent until faded up
      this.elements.set(cfg.id, el);
    }

    this.snap = { ready: true, playing: false, master, volumes };
    this.notify();
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getSnapshot = () => this.snap;
  getServerSnapshot = () => SERVER_SNAPSHOT;

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private rampTo(id: string, target: number, ms = 700) {
    const el = this.elements.get(id);
    if (!el) return;
    const existing = this.fades.get(id);
    if (existing) window.clearInterval(existing);
    const steps = 28;
    const start = el.volume;
    const delta = clamp(target) - start;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      el.volume = clamp(start + delta * (i / steps));
      if (i >= steps) {
        el.volume = clamp(target);
        window.clearInterval(timer);
        this.fades.delete(id);
        if (clamp(target) === 0) el.pause();
      }
    }, ms / steps);
    this.fades.set(id, timer);
  }

  async play() {
    this.init();
    if (this.snap.playing) return;
    for (const [id, el] of this.elements) {
      try {
        await el.play();
        this.rampTo(id, this.snap.master * clamp(this.snap.volumes[id] ?? 0));
      } catch {
        /* blocked or missing source — skip this layer gracefully */
      }
    }
    this.snap = { ...this.snap, playing: true };
    this.notify();
  }

  pause() {
    for (const id of this.elements.keys()) this.rampTo(id, 0);
    this.snap = { ...this.snap, playing: false };
    this.notify();
  }

  toggle() {
    if (this.snap.playing) this.pause();
    else void this.play();
  }

  setMaster(value: number) {
    const master = clamp(value);
    try {
      localStorage.setItem(MASTER_KEY, String(master));
    } catch {
      /* ignore */
    }
    if (this.snap.playing) {
      for (const [id, el] of this.elements) {
        if (!this.fades.has(id)) el.volume = master * clamp(this.snap.volumes[id] ?? 0);
      }
    }
    this.snap = { ...this.snap, master };
    this.notify();
  }

  setLayer(id: string, value: number) {
    const vol = clamp(value);
    try {
      localStorage.setItem(layerKey(id), String(vol));
    } catch {
      /* ignore */
    }
    const el = this.elements.get(id);
    if (el && this.snap.playing && !this.fades.has(id)) el.volume = this.snap.master * vol;
    this.snap = { ...this.snap, volumes: { ...this.snap.volumes, [id]: vol } };
    this.notify();
  }
}

export const focusAudio = new FocusAudioEngine();
