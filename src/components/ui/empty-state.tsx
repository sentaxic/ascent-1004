import Link from "next/link";

export function EmptyState({
  eyebrow,
  title,
  body,
  href,
  action,
  tone = "neutral",
}: {
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
  action?: string;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneClass = tone === "success" ? "border-green-400/25 bg-green-400/[0.045]" : tone === "danger" ? "border-redline/30 bg-redline/[0.06]" : "border-white/10 bg-black/45";
  const eyebrowClass = tone === "success" ? "text-green-400" : tone === "danger" ? "text-redline" : "text-muted";

  return (
    <div className={`terminal-panel mx-auto max-w-3xl rounded-[2rem] border border-dashed p-8 text-center sm:p-10 ${toneClass}`}>
      <p className={`font-mono text-sm uppercase tracking-[0.18em] ${eyebrowClass}`}>{eyebrow}</p>
      <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-ash sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{body}</p>
      {href && action ? (
        <Link href={href} className="button-secondary mt-6 inline-flex rounded-full px-5 py-3 text-xs uppercase tracking-[0.16em]">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
