import { redirect } from "next/navigation";
import LoadingLink from "@/app/components/LoadingLink";
import DiscordAuthButton from "@/app/components/auth/DiscordAuthButton";
import EmailPasswordRegisterForm from "@/app/components/auth/EmailPasswordRegisterForm";
import { getOptionalSession } from "@/app/lib/session";

export const metadata = {
  title: "Registrazione tornei | AoE4 Community Italia",
};

export default async function RegisterPage() {
  const session = await getOptionalSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-amber-400/20 bg-slate-950/70 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Registrazione utente
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Crea il tuo account torneo con email e password, oppure entra con Discord.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Dopo la registrazione riceverai una mail di conferma. Quando l&apos;email
          viene verificata, il callback ti porta nella dashboard utente. Se usi
          Discord, il rientro passa dallo stesso callback `/auth/callback`.
        </p>

        <div className="mt-8 space-y-4">
          {[
            "Email e password per il login standard",
            "Accesso alternativo con OAuth Discord",
            "Nome Steam e nome Discord salvati nel profilo torneo",
            "Conferma email obbligatoria prima dell'accesso completo",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3 text-sm leading-6 text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/30">
        <h2 className="text-2xl font-semibold text-white">Crea account</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Usa dati reali o comunque stabili, cosi gli admin possono riconoscerti
          nei tornei e nelle conferme match.
        </p>

        <div className="mt-8 space-y-5">
          {isSupabaseConfigured ? (
            <div className="space-y-5">
              <EmailPasswordRegisterForm />

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-sm font-semibold text-white">Oppure crea l&apos;account con Discord</p>
                <div className="mt-3">
                  <DiscordAuthButton next="/dashboard" variant="register" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              Mancano `NEXT_PUBLIC_SUPABASE_URL` e
              `NEXT_PUBLIC_SUPABASE_ANON_KEY` oppure
              `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nel file `.env.local`.
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
            Hai gia un account?
            <LoadingLink
              href="/login"
              prefetch={false}
              className="mt-3 flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
            >
              Vai al login
            </LoadingLink>
          </div>
        </div>
      </section>
    </div>
  );
}
