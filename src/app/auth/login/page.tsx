import Link from "next/link";

import { signInAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;

  return (
    <AuthShell title="Enter The Archive" mode="login" message={params.message} error={params.error}>
      <form action={signInAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="mono-label">Email</span>
          <input className="field rounded-2xl px-4 py-3" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Password</span>
          <input className="field rounded-2xl px-4 py-3" name="password" type="password" autoComplete="current-password" placeholder="At least 8 characters" required />
        </label>
        <button className="button-primary w-full rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.16em]">Authenticate</button>
      </form>
      <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-muted">
        <span>Admin-only pages require the Appwrite profile role `admin`.</span>
        <Link href="/auth/recover" className="text-redline">Forgot password?</Link>
      </div>
    </AuthShell>
  );
}
