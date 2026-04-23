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

  const isAuthAvailable = Boolean(
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
    <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr]">
      <section className="cinematic-panel-strong p-8 sm:p-10">
        <p className="cinematic-kicker">{messages.loginPage.eyebrow}</p>
        <h1 className="cinematic-title mt-5 max-w-3xl text-4xl sm:text-5xl">
          {messages.loginPage.title}
        </h1>
        <p className="cinematic-body mt-5 max-w-2xl text-sm sm:text-base">
          {messages.loginPage.description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {messages.loginPage.cards.map((item, index) => (
            <div
              key={item.title}
              className={`${index === 0 ? "cinematic-stat-card" : "cinematic-card-grid"} p-5`}
            >
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#d8cbb7]/74">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cinematic-panel p-8 sm:p-10">
        <h2 className="cinematic-title text-2xl">{messages.loginPage.formTitle}</h2>
        <p className="cinematic-body mt-3 text-sm">{messages.loginPage.formDescription}</p>

        <div className="mt-8 space-y-5">
          {errorMessage ? (
            <div className="cinematic-panel-soft rounded-[1.6rem] border border-rose-500/26 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          {infoMessage ? (
          <div className="cinematic-panel-soft rounded-[1.6rem] border border-[#d9b265]/28 bg-[#d9b265]/10 p-4 text-sm leading-6 text-[#f8edd7]">
              {infoMessage}
            </div>
          ) : null}

          {isAuthAvailable ? (
            <div className="space-y-5">
              <EmailPasswordLoginForm />

              <details className="cinematic-card-grid group rounded-[1.7rem] p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    <span>{messages.loginPage.forgotPassword}</span>
                    <span className="text-xs text-[#bcae9a] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>

                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-7 text-[#d8cbb7]/74">
                    {messages.loginPage.forgotDescription}
                  </p>
                  <PasswordRecoveryRequestForm />
                </div>
              </details>
            </div>
          ) : (
            <div className="cinematic-panel-soft rounded-[1.6rem] border border-amber-400/26 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              {messages.loginPage.missingConfig}
            </div>
          )}

          <div className="cinematic-card-grid rounded-[1.7rem] p-5 text-sm leading-6 text-[#d8cbb7]/84">
            {messages.loginPage.registerPrompt}
            <LoadingLink
              href="/register"
              prefetch={false}
              className="cinematic-button-secondary mt-4 w-full"
            >
              {messages.loginPage.registerCta}
            </LoadingLink>
          </div>

          <div className="cinematic-card-grid rounded-[1.7rem] p-5 text-sm leading-6 text-[#d8cbb7]/84">
            {messages.loginPage.callbackHelp}
          </div>
        </div>
      </section>
    </div>
  );
}

