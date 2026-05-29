"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { MagneticButton } from "@/components/motion/magnetic-button";

/**
 * Server-safe magnetic link. Server Components can't pass a component reference
 * (like next/link) across the boundary as a prop, so this client wrapper holds
 * the Link itself and only accepts serializable props (href/className/strength).
 *
 *   <MagneticLink href="/timeline" className="button-primary …">Enter</MagneticLink>
 */
export function MagneticLink({
  href,
  children,
  className,
  strength,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  return (
    <MagneticButton as={Link} href={href} strength={strength} className={className}>
      {children}
    </MagneticButton>
  );
}
