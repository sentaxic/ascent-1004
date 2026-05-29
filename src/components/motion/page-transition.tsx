"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useCalmMotion } from "@/components/motion/use-reduced-motion";

/**
 * Cinematic route transition. Wraps the page content and, keyed on pathname,
 * cross-fades with a soft blur + rise on navigation. Scrolls to top on route
 * change so the new page begins at its hero.
 *
 *   <PageTransition>{children}</PageTransition>   // in layout, around <main>
 *
 * Calm motion → instant swap, no animation, scroll restore preserved.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const calm = useCalmMotion();

  // Land each new route at the top (the transition reads as a fresh "scene").
  useEffect(() => {
    if (calm) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, calm]);

  if (calm) {
    return <div className="page-transition">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="page-transition"
        initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
