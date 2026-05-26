import Image from "next/image";

import type { PostMedia } from "@/lib/types";

export function MediaGrid({ media }: { media: PostMedia[] }) {
  if (!media.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {media.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {item.kind === "video" ? (
            <video src={item.url} controls className="aspect-video w-full object-cover" />
          ) : item.kind === "embed" ? (
            <iframe src={item.url} title={item.alt} className="aspect-video w-full" loading="lazy" />
          ) : (
            <Image src={item.url} alt={item.alt} width={item.width ?? 1200} height={item.height ?? 800} className="aspect-video w-full object-cover transition duration-500 hover:scale-[1.03]" />
          )}
        </div>
      ))}
    </div>
  );
}
