"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";

import { useCalmMotion } from "@/components/motion/use-reduced-motion";

type SplitTextProps = {
  /** The text to reveal. Plain string — splits internally. */
  children: string;
  /** Split granularity. "word" (default) or "char". */
  by?: "word" | "char";
  /** Render element. Default "span". For headlines pass as="h1". */
  as?: ElementType;
  /** Per-unit stagger in seconds. Default 0.045. */
  stagger?: number;
  /** Delay before the first unit, in seconds. */
  delay?: number;
  /** Animate only once on enter. Default true. */
  once?: boolean;
  className?: string;
};

const container = (stagger: number, delay: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const unit = {
  hidden: { y: "0.9em", opacity: 0, filter: "blur(6px)" },
  visible: {
    y: "0em",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Typographic line/word reveal — each word (or char) rises out of a clipped
 * mask with a stagger as it scrolls into view. The cinematic way to land a
 * headline.
 *
 *   <SplitText as="h1" className="display text-display-lg">RAIN ON GLASS</SplitText>
 *   <RevealText by="char" stagger={0.02}>1004</RevealText>
 *
 * Calm motion → renders the plain string immediately.
 */
export function SplitText({
  children,
  by = "word",
  as = "span",
  stagger = 0.045,
  delay = 0,
  once = true,
  className,
}: SplitTextProps) {
  const calm = useCalmMotion();
  const Tag = as as ElementType;

  if (calm) {
    return <Tag className={className}>{children}</Tag>;
  }

  const tokens = by === "char" ? Array.from(children) : children.split(/(\s+)/);
  const MotionTag = motion(as as ElementType) as typeof motion.span;

  return (
    <MotionTag
      className={className}
      variants={container(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      aria-label={children}
    >
      {tokens.map((token, index) => {
        if (/^\s+$/.test(token)) {
          // Preserve whitespace without animating it.
          return <span key={`s-${index}`} aria-hidden>{token}</span>;
        }
        return (
          <span key={`${token}-${index}`} aria-hidden className="inline-block overflow-hidden align-bottom">
            <motion.span variants={unit} className="inline-block">
              {token}
            </motion.span>
          </span>
        );
      })}
    </MotionTag>
  );
}

/** Alias — same component, exposed under the brief's second name. */
export const RevealText = SplitText;
