import { signUpAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;

  return (
    <AuthShell title="Join As Observer" mode="signup" message={params.message} error={params.error}>
      <form action={signUpAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="mono-label">Username</span>
            <input className="field rounded-2xl px-4 py-3" name="username" autoComplete="username" placeholder="observer_name" required />
            <span className="input-help">The username Micheal is reserved unless the email matches `APPWRITE_ADMIN_EMAIL`.</span>
          </label>
          <label className="block space-y-2">
            <span className="mono-label">Display name</span>
            <input className="field rounded-2xl px-4 py-3" name="displayName" autoComplete="name" placeholder="Name shown on comments" />
          </label>
        </div>
        <label className="block space-y-2">
          <span className="mono-label">Email</span>
          <input className="field rounded-2xl px-4 py-3" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Password</span>
          <input className="field rounded-2xl px-4 py-3" name="password" type="password" minLength={8} autoComplete="new-password" placeholder="At least 8 characters" required />
        </label>
        <button className="button-primary w-full rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.16em]">Create observer account</button>
      </form>
    </AuthShell>
  );
}
