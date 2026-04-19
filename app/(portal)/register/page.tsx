import { redirect } from "next/navigation";
import LoadingLink from "@/app/components/LoadingLink";
import EmailPasswordRegisterForm from "@/app/components/auth/EmailPasswordRegisterForm";
import { getTranslations } from "@/app/lib/i18n";
import { getOptionalSession } from "@/app/lib/session";

export async function generateMetadata() {
  const { messages } = await getTranslations();

  return {
    title: messages.metadata.registerTitle,
  };
}

export default async function RegisterPage() {
  const session = await getOptionalSession();
  const { messages } = await getTranslations();

  if (session?.user) {
    redirect("/dashboard");
  }

  const isRegistrationAvailable = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <section className="cinematic-panel-strong p-8 sm:p-10">
        <p className="cinematic-kicker">{messages.registerPage.eyebrow}</p>
        <h1 className="cinematic-title mt-5 max-w-3xl text-4xl sm:text-5xl">
          {messages.registerPage.title}
        </h1>
        <p className="cinematic-body mt-5 max-w-2xl text-sm sm:text-base">
          {messages.registerPage.description}
        </p>

        <div className="mt-8 grid gap-4">
          {messages.registerPage.bullets.map((item, index) => (
            <div
              key={item}
              className={`${index === 0 ? "cinematic-stat-card" : "cinematic-card-grid"} flex gap-4 rounded-[1.6rem] p-5 text-sm leading-7 text-slate-200/84`}
            >
              <span className="text-sm font-semibold text-amber-200">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cinematic-panel p-8 sm:p-10">
        <h2 className="cinematic-title text-2xl">{messages.registerPage.formTitle}</h2>
        <p className="cinematic-body mt-3 text-sm">{messages.registerPage.formDescription}</p>

        <div className="mt-8 space-y-5">
          {isRegistrationAvailable ? (
            <EmailPasswordRegisterForm />
          ) : (
            <div className="cinematic-panel-soft rounded-[1.6rem] border border-amber-400/26 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              {messages.registerPage.missingConfig}
            </div>
          )}

          <div className="cinematic-card-grid rounded-[1.7rem] p-5 text-sm leading-6 text-slate-300/84">
            {messages.registerPage.loginPrompt}
            <LoadingLink
              href="/login"
              prefetch={false}
              className="cinematic-button-secondary mt-4 w-full"
            >
              {messages.registerPage.loginCta}
            </LoadingLink>
          </div>
        </div>
      </section>
    </div>
  );
}
