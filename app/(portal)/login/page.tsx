import { redirect } from "next/navigation";
import LoadingLink from "@/app/components/LoadingLink";
import EmailPasswordLoginForm from "@/app/components/auth/EmailPasswordLoginForm";
import PasswordRecoveryRequestForm from "@/app/components/auth/PasswordRecoveryRequestForm";
import { getOptionalSession } from "@/app/lib/session";

export const metadata = {
  title: "Login tornei | AoE4 Community Italia",
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function getLoginErrorMessage(errorCode: string | undefined) {
  if (errorCode === "supabase_env") {
    return "Mancano le variabili pubbliche Supabase nel file .env.local.";
  }

  if (errorCode === "auth_callback") {
    return "La conferma email non e andata a buon fine. Riprova ad aprire il link ricevuto.";
  }

  return null;
}

function getLoginInfoMessage(messageCode: string | undefined) {
  if (messageCode === "password_updated") {
    return "Password aggiornata. Ora puoi accedere con le nuove credenziali.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getOptionalSession();
  const resolvedSearchParams = searchParams ? await searchParams : {};

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
  const errorMessage = getLoginErrorMessage(resolvedSearchParams.error);
  const infoMessage = getLoginInfoMessage(resolvedSearchParams.message);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[2rem] border border-amber-400/20 bg-slate-950/70 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Accesso tornei
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Login email e password, semplice e allineato al backend torneo.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Il portale usa sessioni Supabase standard, senza Google. L&apos;utente
          si registra con email, password, nome Steam e nome Discord, conferma
          l&apos;email e poi entra direttamente nella dashboard.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Email verification",
              text: "L'accesso viene abilitato dopo la conferma dell'indirizzo email.",
            },
            {
              title: "Dashboard player",
              text: "Prossimo avversario, stato match e bracket aggiornato.",
            },
            {
              title: "Console admin",
              text: "Creazione torneo, roster manuale, approvazioni e override risultati.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
            >
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/30">
        <h2 className="text-2xl font-semibold text-white">Entra nel portale</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Inserisci le credenziali del tuo account. Se non hai ancora un profilo,
          completa prima la registrazione.
        </p>

        <div className="mt-8 space-y-5">
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          {infoMessage ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">
              {infoMessage}
            </div>
          ) : null}

          {isSupabaseConfigured ? (
            <div className="space-y-5">
              <EmailPasswordLoginForm />

              <details className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    <span>Password dimenticata?</span>
                    <span className="text-xs text-slate-400 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>

                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-6 text-slate-400">
                    Inserisci la tua email e ti mandiamo un link per reimpostare la password.
                  </p>
                  <PasswordRecoveryRequestForm />
                </div>
              </details>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              Mancano `NEXT_PUBLIC_SUPABASE_URL` e
              `NEXT_PUBLIC_SUPABASE_ANON_KEY` oppure
              `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nel file `.env.local`.
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
            Registrazione account:
            <LoadingLink
              href="/register"
              prefetch={false}
              className="mt-3 flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
            >
              Vai alla pagina registrazione
            </LoadingLink>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
            Callback locale per conferma email:
            <span className="mt-2 block rounded-xl bg-slate-950 px-3 py-2 font-mono text-xs text-amber-200">
              http://localhost:3000/auth/callback
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
