import { requestRecoveryAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function RecoverPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;

  return (
    <AuthShell title="Recover Access" mode="recover" message={params.message} error={params.error}>
      <form action={requestRecoveryAction} className="space-y-4">
        <label className="block space-y-2">
          <span className="mono-label">Account email</span>
          <input className="field rounded-2xl px-4 py-3" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </label>
        <button className="button-primary w-full rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.16em]">Send recovery link</button>
      </form>
    </AuthShell>
  );
}
