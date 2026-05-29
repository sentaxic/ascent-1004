"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { useCalmMotion } from "@/components/motion/use-reduced-motion";

type ParallaxProps = {
  children: ReactNode;
  /**
   * Travel distance in px across the element's scroll pass. Positive moves the
   * layer down (appears further back); negative moves it up (nearer). Keep it
   * subtle (±20..80) — this is depth, not a slideshow.
   */
  offset?: number;
  /** Parallax the X axis instead of Y. */
  axis?: "x" | "y";
  className?: string;
};

/**
 * Subtle scroll parallax for layered depth. Wrap a decorative or secondary
 * layer; it drifts as the section scrolls through the viewport.
 *
 *   <Parallax offset={-40}><Image … /></Parallax>
 *
 * Calm motion → static passthrough.
 */
export function Parallax({ children, offset = 40, axis = "y", className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const calm = useCalmMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const translate = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  if (calm) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={axis === "y" ? { y: translate, willChange: "transform" } : { x: translate, willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
