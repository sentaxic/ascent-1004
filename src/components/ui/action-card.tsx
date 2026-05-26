import Link from "next/link";

type ActionCardProps = {
  index: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  tone?: "default" | "red" | "green" | "amber";
};

const toneClasses = {
  default: "border-white/10 bg-white/[0.035]",
  red: "border-redline/30 bg-redline/[0.06]",
  green: "border-green-400/25 bg-green-400/[0.045]",
  amber: "border-amber/25 bg-amber/[0.055]",
};

export function ActionCard({ index, title, body, href, cta = "Open", tone = "default" }: ActionCardProps) {
  const content = (
    <article className={`group h-full rounded-[1.5rem] border p-5 transition duration-300 hover:-translate-y-1 hover:border-redline/45 hover:bg-redline/[0.055] ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="mono-label text-redline">{index}</span>
        {href ? <span className="text-xs uppercase tracking-[0.16em] text-muted transition group-hover:text-ash">{cta}</span> : null}
      </div>
      <h3 className="mt-8 text-xl font-semibold tracking-[-0.05em] text-ash">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
    </article>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
