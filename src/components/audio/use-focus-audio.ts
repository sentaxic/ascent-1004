"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";

import { focusAudio } from "@/lib/audio";

/**
 * React binding for the focus-environment audio engine. The engine is a
 * module singleton, so audio keeps playing across route changes; this hook just
 * subscribes a component to its snapshot and exposes the controls.
 */
export function useFocusAudio() {
  useEffect(() => {
    focusAudio.init();
  }, []);

  const snapshot = useSyncExternalStore(
    focusAudio.subscribe,
    focusAudio.getSnapshot,
    focusAudio.getServerSnapshot,
  );

  return {
    ...snapshot,
    play: () => focusAudio.play(),
    pause: () => focusAudio.pause(),
    toggle: () => focusAudio.toggle(),
    setMaster: (v: number) => focusAudio.setMaster(v),
    setLayer: (id: string, v: number) => focusAudio.setLayer(id, v),
  };
}
