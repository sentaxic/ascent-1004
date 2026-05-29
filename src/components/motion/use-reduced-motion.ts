"use client";

import { useEffect, useState } from "react";

import { useAtmosphere } from "@/components/providers/theme-provider";

/**
 * True when motion should be calmed: either the OS prefers-reduced-motion is
 * set, OR the user has enabled focus mode. Every motion primitive reads this
 * and degrades to a static (still-accessible) state.
 */
export function useCalmMotion(): boolean {
  const { focusMode } = useAtmosphere();
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return prefersReduced || focusMode;
}
