import LoadingLink from "@/app/components/LoadingLink";
import ResetPasswordForm from "@/app/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Nuova password | AoE4 Community Italia",
};

export default function ResetPasswordPage() {
  const isRecoveryAvailable = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] border border-amber-400/20 bg-slate-950/70 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Recupero account
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Imposta una nuova password e torna subito nel portale.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Questa pagina funziona dopo aver aperto il link ricevuto via email. Una
          volta salvata la nuova password verrai rimandato al login.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/30">
        <h2 className="text-2xl font-semibold text-white">Nuova password</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Scegli una password nuova semplice, con almeno 6 caratteri.
        </p>

        <div className="mt-8 space-y-5">
          {isRecoveryAvailable ? (
            <ResetPasswordForm />
          ) : (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              Il recupero password non e disponibile in questo momento. Riprova tra poco.
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
            Hai gia recuperato l&apos;account?
            <LoadingLink
              href="/login"
              prefetch={false}
              className="mt-3 flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
            >
              Torna al login
            </LoadingLink>
          </div>
        </div>
      </section>
    </div>
  );
}
