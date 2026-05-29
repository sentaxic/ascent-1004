import Link from "next/link";
import type { ReactNode } from "react";

const observerAbilities = ["Comment under public posts", "Customize avatar and banner", "Keep a visible profile and social links"];

export function AuthShell({ title, mode, children, message, error }: { title: string; mode: "login" | "signup" | "verify" | "recover" | "reset"; children: ReactNode; message?: string; error?: string }) {
  return (
    <div className="container-shell grid min-h-[calc(100vh-6rem)] place-items-center py-12">
      <section className="terminal-panel grid w-full max-w-5xl overflow-hidden rounded-[2.25rem] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="mission-rail border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="mono-label text-redline">auth / appwrite secure channel</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.08em] text-ash sm:text-5xl">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            Appwrite handles encrypted passwords, email verification, secure sessions, recovery tokens, and production-safe callbacks. Publishing stays locked to Micheal.
          </p>
          <div className="mt-6 space-y-3">
            {observerAbilities.map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <p className="mono-label text-redline">0{index + 1}</p>
                <p className="mt-2 text-sm text-ash">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {message ? <p className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-ash">{message}</p> : null}
          {error ? <p className="mb-5 rounded-2xl border border-redline/35 bg-redline/[0.08] p-3 text-sm text-redline">{error}</p> : null}
          {children}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-muted">
            {mode === "login" ? (
              <>Need an observer account? <Link className="text-redline" href="/auth/signup">Create one</Link>.</>
            ) : mode === "signup" ? (
              <>Already registered? <Link className="text-redline" href="/auth/login">Log in</Link>.</>
            ) : (
              <>Return to <Link className="text-redline" href="/auth/login">login</Link> or the <Link className="text-redline" href="/">command center</Link>.</>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
