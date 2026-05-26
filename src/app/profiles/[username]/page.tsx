export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { updateProfileAction } from "@/app/actions/profile";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentProfile, getProfileByUsername, getProfileComments } from "@/lib/data";
import { safeUrl } from "@/lib/utils";

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ username }, query, currentProfile] = await Promise.all([params, searchParams, getCurrentProfile()]);
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const comments = await getProfileComments(profile.id);
  const isOwner = currentProfile?.id === profile.id;

  return (
    <div className="container-shell space-y-5 py-10 sm:py-14">
      <section className="terminal-panel overflow-hidden rounded-[2.25rem]">
        <div className="relative h-48 border-b border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(255,59,48,0.22),transparent_22rem),linear-gradient(135deg,#17120f,#050505)] sm:h-56">
          {profile.bannerUrl ? <img src={profile.bannerUrl} alt="Profile banner" className="h-full w-full object-cover opacity-80" /> : null}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />
        </div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-end gap-5">
            <div className="-mt-20 grid size-28 place-items-center overflow-hidden rounded-3xl border border-redline/35 bg-black text-4xl text-redline shadow-[0_0_40px_rgba(255,59,48,0.12)] sm:size-32">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt={`${profile.username} avatar`} className="h-full w-full object-cover" /> : profile.displayName.slice(0, 1)}
            </div>
            <div className="pb-1">
              <p className="mono-label text-redline">{profile.role === "admin" ? "operator / admin" : "observer profile"}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.07em] text-ash sm:text-5xl">{profile.displayName}</h1>
              <p className="mt-1 text-sm text-muted">@{profile.username} / joined {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">{profile.bio ?? "No bio transmitted yet."}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.socialLinks.length ? profile.socialLinks.map((link) => (
              <a key={link.url} href={safeUrl(link.url)} target="_blank" rel="noreferrer" className="glow-link rounded-full px-3 py-2 text-xs text-muted">{link.label}</a>
            )) : <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-muted">No social links yet</span>}
          </div>
        </div>
      </section>

      {query.error ? <p className="rounded-2xl border border-redline/35 bg-redline/[0.08] p-4 text-sm text-redline">{query.error}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        {isOwner ? (
          <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
            <SectionHeading eyebrow="profile editor" title="Make your observer card feel human" description="Avatar, banner, bio, and links update your public profile. Comments remain attached to this identity." />
            <form action={updateProfileAction} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="mono-label">Username</span>
                  <input className="field rounded-2xl px-4 py-3" name="username" defaultValue={profile.username} required />
                </label>
                <label className="block space-y-2">
                  <span className="mono-label">Display name</span>
                  <input className="field rounded-2xl px-4 py-3" name="displayName" defaultValue={profile.displayName} />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="mono-label">Bio</span>
                <textarea className="field min-h-28 rounded-2xl px-4 py-3" name="bio" defaultValue={profile.bio ?? ""} placeholder="What are you building or tracking?" />
              </label>
              <label className="block space-y-2">
                <span className="mono-label">Social links</span>
                <textarea className="field min-h-24 rounded-2xl px-4 py-3" name="socialLinks" defaultValue={profile.socialLinks.map((link) => `${link.label}|${link.url}`).join("\n")} placeholder="GitHub|https://github.com/..." />
                <span className="input-help">One per line: Label|https://link.com. Up to 5 links are shown.</span>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="mono-label">Avatar image</span>
                  <input className="field rounded-2xl px-4 py-3" name="avatar" type="file" accept="image/*,.gif" />
                </label>
                <label className="block space-y-2">
                  <span className="mono-label">Banner image</span>
                  <input className="field rounded-2xl px-4 py-3" name="banner" type="file" accept="image/*,.gif" />
                </label>
              </div>
              <button className="button-primary rounded-2xl px-5 py-3 text-xs uppercase tracking-[0.16em]">Save profile</button>
            </form>
          </section>
        ) : null}

        <section className="terminal-panel rounded-[2rem] p-5 sm:p-6">
          <SectionHeading eyebrow="comment history" title="Recent Transmissions" description={`${comments.length} comments shown`} />
          <div className="mt-5 space-y-3">
            {comments.length ? comments.map((comment) => (
              <article key={comment.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <time className="text-xs text-muted">{new Date(comment.createdAt).toLocaleString()}</time>
                <p className="mt-2 text-sm leading-6 text-muted">{comment.body}</p>
              </article>
            )) : (
              <EmptyState
                eyebrow="> NO COMMENTS YET"
                title="No observer transmissions."
                body="This profile has not commented under a mission post yet. Once they do, the latest entries will appear here."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
