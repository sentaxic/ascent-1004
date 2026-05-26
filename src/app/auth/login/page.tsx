import { signInAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;

  return (
    <AuthShell title="Enter The Archive" mode="login" message={params.message} error={params.error}>
      <form action={signInAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="mono-label">Email</span>
          <input className="field rounded-2xl px-4 py-3" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block space-y-2">
          <span className="mono-label">Password</span>
          <input className="field rounded-2xl px-4 py-3" name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="button-primary w-full rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.16em]">Authenticate</button>
      </form>
    </AuthShell>
  );
}
