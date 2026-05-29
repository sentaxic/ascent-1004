"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useAtmosphere } from "@/components/providers/theme-provider";
import { atmosphereForPath } from "@/lib/atmosphere";

/**
 * Auto-themes the environment from the current route (mission/physics/gym/…),
 * so the accent + ambient tint shift as you move through the world. Individual
 * pages can still override with <Atmosphere name="…" />. Mounts once in layout.
 */
export function RouteAtmosphere() {
  const pathname = usePathname();
  const { setAtmosphere } = useAtmosphere();

  useEffect(() => {
    setAtmosphere(atmosphereForPath(pathname || "/"));
  }, [pathname, setAtmosphere]);

  return null;
}
