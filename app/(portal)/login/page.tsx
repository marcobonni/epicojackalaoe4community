import { redirect } from "next/navigation";
import LoadingLink from "@/app/components/LoadingLink";
import EmailPasswordLoginForm from "@/app/components/auth/EmailPasswordLoginForm";
import PasswordRecoveryRequestForm from "@/app/components/auth/PasswordRecoveryRequestForm";
import { getTranslations } from "@/app/lib/i18n";
import { getOptionalSession } from "@/app/lib/session";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export async function generateMetadata() {
  const { messages } = await getTranslations();

  return {
    title: messages.metadata.loginTitle,
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getOptionalSession();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const { messages } = await getTranslations();

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

  const errorMessage =
    resolvedSearchParams.error === "supabase_env"
      ? messages.loginPage.errors.supabaseEnv
      : resolvedSearchParams.error === "auth_callback"
        ? messages.loginPage.errors.authCallback
        : null;

  const infoMessage =
    resolvedSearchParams.message === "password_updated"
      ? messages.loginPage.infos.passwordUpdated
      : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[2rem] border border-amber-400/20 bg-slate-950/70 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          {messages.loginPage.eyebrow}
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {messages.loginPage.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          {messages.loginPage.description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {messages.loginPage.cards.map((item) => (
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
        <h2 className="text-2xl font-semibold text-white">{messages.loginPage.formTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {messages.loginPage.formDescription}
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
                    <span>{messages.loginPage.forgotPassword}</span>
                    <span className="text-xs text-slate-400 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>

                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-6 text-slate-400">
                    {messages.loginPage.forgotDescription}
                  </p>
                  <PasswordRecoveryRequestForm />
                </div>
              </details>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              {messages.loginPage.missingConfig}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
            {messages.loginPage.registerPrompt}
            <LoadingLink
              href="/register"
              prefetch={false}
              className="mt-3 flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
            >
              {messages.loginPage.registerCta}
            </LoadingLink>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
            {messages.loginPage.callbackHelp}
            <span className="mt-2 block rounded-xl bg-slate-950 px-3 py-2 font-mono text-xs text-amber-200">
              /auth/callback
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
