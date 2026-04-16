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
          {messages.registerPage.eyebrow}
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {messages.registerPage.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          {messages.registerPage.description}
        </p>

        <div className="mt-8 space-y-4">
          {messages.registerPage.bullets.map((item) => (
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
        <h2 className="text-2xl font-semibold text-white">{messages.registerPage.formTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {messages.registerPage.formDescription}
        </p>

        <div className="mt-8 space-y-5">
          {isSupabaseConfigured ? (
            <EmailPasswordRegisterForm />
          ) : (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
              {messages.registerPage.missingConfig}
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-6 text-slate-300">
            {messages.registerPage.loginPrompt}
            <LoadingLink
              href="/login"
              prefetch={false}
              className="mt-3 flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
            >
              {messages.registerPage.loginCta}
            </LoadingLink>
          </div>
        </div>
      </section>
    </div>
  );
}
