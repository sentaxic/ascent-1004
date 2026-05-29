"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ElementType, type PointerEvent, type ReactNode } from "react";

import { useCalmMotion } from "@/components/motion/use-reduced-motion";

type MagneticProps = {
  children: ReactNode;
  /** Pull strength 0..1 — fraction of the cursor offset followed. Default 0.35. */
  strength?: number;
  /** Render element/component. Default "button". */
  as?: ElementType;
  className?: string;
  /** Marks the element for the custom cursor's active state. Default true. */
  cursorActive?: boolean;
} & Record<string, unknown>;

/**
 * Magnetic hover: the element eases toward the cursor while hovered and springs
 * back on leave. Use for primary CTAs, the nav logo, audio trigger, etc.
 *
 *   <MagneticButton as={Link} href="/timeline" className="button-primary …">…</MagneticButton>
 *
 * Calm motion / touch → plain element, no magnetism. Carries data-cursor so the
 * custom cursor scales over it.
 */
export function MagneticButton({
  children,
  strength = 0.35,
  as = "button",
  className,
  cursorActive = true,
  ...rest
}: MagneticProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const calm = useCalmMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const MotionTag = motion(as as ElementType) as typeof motion.button;

  const handleMove = (event: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  if (calm) {
    const Tag = as as ElementType;
    return (
      <Tag ref={ref} className={className} data-cursor={cursorActive ? "active" : undefined} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      ref={ref}
      className={className}
      data-cursor={cursorActive ? "active" : undefined}
      style={{ x: sx, y: sy }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
