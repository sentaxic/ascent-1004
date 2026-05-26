import Link from "next/link";
import type { ReactNode } from "react";

type HeroAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions = [],
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: HeroAction[];
  children?: ReactNode;
}) {
  return (
    <section className="terminal-panel reveal overflow-hidden rounded-[2.25rem] p-5 sm:p-7 lg:p-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-redline/80 to-transparent" />
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mono-label text-redline">{eyebrow}</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold leading-[0.96] tracking-[-0.08em] text-ash sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-muted sm:text-base sm:leading-7">{description}</p>
        </div>
        {actions.length ? (
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {actions.map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className={`${action.variant === "secondary" ? "button-secondary" : "button-primary"} rounded-full px-5 py-3 text-xs uppercase tracking-[0.16em]`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-7">{children}</div> : null}
    </section>
  );
}
