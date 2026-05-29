"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ElementType, ReactNode } from "react";

import { useCalmMotion } from "@/components/motion/use-reduced-motion";

type RevealProps = {
  children: ReactNode;
  /** Render element/component (motion-wrapped). Default "div". */
  as?: ElementType;
  /** Stagger start, in seconds. */
  delay?: number;
  /** Rise distance in px. Default 26. */
  y?: number;
  /** Animation duration in seconds. Default 0.7. */
  duration?: number;
  /** Only animate the first time it enters. Default true. */
  once?: boolean;
  /** viewport margin — start a touch before fully on-screen. */
  margin?: string;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children" | "ref">;

/**
 * Scroll-triggered editorial reveal: fade + soft blur + rise as the element
 * enters the viewport. The signature foundation motion of the site.
 *
 *   <Reveal><h2 className="display ...">…</h2></Reveal>
 *   <Reveal as="section" delay={0.1}>…</Reveal>
 *
 * Calm motion (reduced-motion or focus mode) → renders fully visible, no motion.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 26,
  duration = 0.7,
  once = true,
  margin = "-12% 0px -12% 0px",
  className,
  ...rest
}: RevealProps) {
  const calm = useCalmMotion();
  const MotionTag = motion(as as ElementType) as typeof motion.div;

  if (calm) {
    const Tag = as as ElementType;
    return (
      <Tag className={className} {...(rest as Record<string, unknown>)}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: margin as never }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
