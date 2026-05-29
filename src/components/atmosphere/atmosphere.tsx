"use client";

import { useEffect } from "react";

import { useAtmosphere } from "@/components/providers/theme-provider";
import { DEFAULT_ATMOSPHERE, type AtmosphereName } from "@/lib/atmosphere";

/**
 * Declaratively set the page/section atmosphere. Drop near the top of a server
 * page (it renders nothing) to shift the global accent + ambient tint:
 *
 *   <Atmosphere name="physics" />
 *
 * On unmount it restores the previous atmosphere, so a modal/section that sets
 * its own theme cleans up after itself. Page builders may also use the
 * useAtmosphere() hook directly for interactive control.
 */
export function Atmosphere({ name }: { name: AtmosphereName }) {
  const { atmosphere, setAtmosphere } = useAtmosphere();

  useEffect(() => {
    const previous = atmosphere;
    setAtmosphere(name);
    return () => setAtmosphere(previous);
    // Re-run only when the requested name changes; `previous` is captured at
    // mount intentionally so cleanup restores the pre-mount theme.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return null;
}

Atmosphere.defaultName = DEFAULT_ATMOSPHERE;
