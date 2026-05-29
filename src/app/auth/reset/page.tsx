import { resetPasswordAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function ResetPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;

  return (
    <AuthShell title="Reset Password" mode="reset" message={params.message} error={params.error}>
      <form action={resetPasswordAction} className="space-y-4">
        <input type="hidden" name="userId" value={params.userId ?? ""} />
        <input type="hidden" name="secret" value={params.secret ?? ""} />
        <label className="block space-y-2">
          <span className="mono-label">New password</span>
          <input className="field rounded-2xl px-4 py-3" name="password" type="password" minLength={8} autoComplete="new-password" placeholder="At least 8 characters" required />
        </label>
        <button className="button-primary w-full rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.16em]">Update password</button>
      </form>
    </AuthShell>
  );
}
