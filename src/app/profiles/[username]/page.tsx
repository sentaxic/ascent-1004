export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { updateProfileAction } from "@/app/actions/profile";
import { getCurrentProfile, getProfileByUsername, getProfileComments } from "@/lib/data";
import { safeUrl } from "@/lib/utils";

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ username }, query, currentProfile] = await Promise.all([params, searchParams, getCurrentProfile()]);
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const comments = await getProfileComments(profile.id);
  const isOwner = currentProfile?.id === profile.id;

  return (
    <div className="container-shell py-10 sm:py-14">
      <section className="terminal-panel overflow-hidden rounded-[2rem]">
        <div className="h-44 border-b border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,59,48,0.22),transparent_22rem),linear-gradient(135deg,#12100f,#050505)]">
          {profile.bannerUrl ? <img src={profile.bannerUrl} alt="Profile banner" className="h-full w-full object-cover opacity-75" /> : null}
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-end gap-5">
            <div className="-mt-16 grid size-28 place-items-center overflow-hidden rounded-3xl border border-redline/35 bg-black text-4xl text-redline shadow-[0_0_40px_rgba(255,59,48,0.12)]">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={`${profile.username} avatar`} className="h-full w-full object-cover" /> : profile.displayName.slice(0, 1)}
            </div>
            <div className="pb-1">
              <p className="mono-label text-redline">{profile.role}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.07em] text-ash">{profile.displayName}</h1>
              <p className="mt-1 text-sm text-muted">@{profile.username} / joined {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">{profile.bio ?? "No bio transmitted yet."}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.socialLinks.map((link) => (
              <a key={link.url} href={safeUrl(link.url)} target="_blank" rel="noreferrer" className="glow-link rounded-full px-3 py-2 text-xs text-muted">{link.label}</a>
            ))}
          </div>
        </div>
      </section>

      {query.error ? <p className="mt-5 rounded-2xl border border-redline/35 bg-redline/[0.08] p-4 text-sm text-redline">{query.error}</p> : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        {isOwner ? (
          <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
            <p className="mono-label text-redline">profile editor</p>
            <form action={updateProfileAction} className="mt-5 space-y-4">
              <input className="field rounded-2xl px-4 py-3" name="username" defaultValue={profile.username} required />
              <input className="field rounded-2xl px-4 py-3" name="displayName" defaultValue={profile.displayName} />
              <textarea className="field min-h-28 rounded-2xl px-4 py-3" name="bio" defaultValue={profile.bio ?? ""} placeholder="Bio" />
              <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="socialLinks" defaultValue={profile.socialLinks.map((link) => `${link.label}|${link.url}`).join("\n")} placeholder="GitHub|https://github.com/..." />
              <label className="block space-y-2">
                <span className="mono-label">Avatar image</span>
                <input className="field rounded-2xl px-4 py-3" name="avatar" type="file" accept="image/*,.gif" />
              </label>
              <label className="block space-y-2">
                <span className="mono-label">Banner image</span>
                <input className="field rounded-2xl px-4 py-3" name="banner" type="file" accept="image/*,.gif" />
              </label>
              <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Save profile</button>
            </form>
          </section>
        ) : null}

        <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mono-label text-redline">comment history</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ash">Recent Transmissions</h2>
            </div>
            <p className="text-xs text-muted">{comments.length} shown</p>
          </div>
          <div className="mt-5 space-y-3">
            {comments.length ? comments.map((comment) => (
              <article key={comment.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <time className="text-xs text-muted">{new Date(comment.createdAt).toLocaleString()}</time>
                <p className="mt-2 text-sm leading-6 text-muted">{comment.body}</p>
              </article>
            )) : <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">No comments yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
