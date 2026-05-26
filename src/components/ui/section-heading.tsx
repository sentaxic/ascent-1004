export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mono-label text-redline">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash sm:text-3xl">{title}</h2>
      </div>
      {description ? <p className="max-w-xl text-sm leading-6 text-muted">{description}</p> : null}
    </div>
  );
}
