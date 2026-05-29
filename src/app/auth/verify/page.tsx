import { resendVerificationAction, verifyEmailAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const userId = params.userId ?? "";
  const secret = params.secret ?? "";

  return (
    <AuthShell title="Verify Signal Origin" mode="verify" message={params.message} error={params.error}>
      {userId && secret ? (
        <form action={verifyEmailAction} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="secret" value={secret} />
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-muted">
            Verification token detected. Confirm this device to unlock the observer channel.
          </p>
          <button className="button-primary w-full rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.16em]">Confirm email address</button>
        </form>
      ) : (
        <form action={resendVerificationAction} className="space-y-4">
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-muted">
            If your verification email did not arrive, resend it from here. The redirect URL uses the deployed site domain, so it works on desktop and mobile.
          </p>
          <button className="button-secondary w-full rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.16em]">Resend verification email</button>
        </form>
      )}
    </AuthShell>
  );
}
