import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ title, mode, children, message, error }: { title: string; mode: "login" | "signup"; children: ReactNode; message?: string; error?: string }) {
  return (
    <div className="container-shell grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <section className="terminal-panel w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <p className="mono-label text-redline">auth / encrypted access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-ash">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Supabase Auth handles password hashing and sessions. Public users can comment and customize profiles; publishing stays admin-only.
        </p>
        {message ? <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-ash">{message}</p> : null}
        {error ? <p className="mt-5 rounded-2xl border border-redline/35 bg-redline/[0.08] p-3 text-sm text-redline">{error}</p> : null}
        <div className="mt-6">{children}</div>
        <div className="mt-6 text-sm text-muted">
          {mode === "login" ? (
            <>Need an account? <Link className="text-redline" href="/auth/signup">Create one</Link>.</>
          ) : (
            <>Already have an account? <Link className="text-redline" href="/auth/login">Log in</Link>.</>
          )}
        </div>
      </section>
    </div>
  );
}
