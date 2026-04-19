import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "@/app/lib/i18n";
import {
  patchBannerStateConfig,
  type PatchBannerState,
} from "@/app/patch-notes/patchNotesData";
import { getPatchArchive, getPatchDetail } from "@/app/patch-notes/patchNotesApi";
import { normalizePatchDisplayLine } from "@/app/patch-notes/patchNotesTranslations";

export const metadata: Metadata = {
  title: "AoE4 Patch Archive | AoE4 Community Italia",
  description:
    "Archivio patch ufficiali di Age of Empires IV con selezione della patch e testo civ-specifico ufficiale, quando presente.",
};

type PageProps = {
  searchParams?: Promise<{
    patch?: string;
  }>;
};

function PatchStateIcon({ state }: { state: PatchBannerState }) {
  if (state === "buff") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M12 18V6m0 0-5 5m5-5 5 5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
      </svg>
    );
  }

  if (state === "nerf") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M12 6v12m0 0-5-5m5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M6 12h12"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

async function selectPatch(formData: FormData) {
  "use server";

  const patch = String(formData.get("patch") ?? "").trim();

  if (!patch) {
    redirect("/patch-notes");
  }

  redirect(`/patch-notes?patch=${encodeURIComponent(patch)}`);
}

export default async function PatchNotesPage({ searchParams }: PageProps) {
  await getTranslations();
  const resolvedSearchParams = (await searchParams) ?? {};
  const archive = await getPatchArchive();
  const activeSlug = resolvedSearchParams.patch ?? archive[0]?.slug ?? "";
  const patchDetail = (await getPatchDetail(activeSlug)) ?? (archive[0] ? await getPatchDetail(archive[0].slug) : null);

  if (!patchDetail) {
    throw new Error("Unable to load the selected patch notes.");
  }

  const buffCount = patchDetail.civilizations.filter((entry) => entry.state === "buff").length;
  const nerfCount = patchDetail.civilizations.filter((entry) => entry.state === "nerf").length;
  const reworkCount = patchDetail.civilizations.filter((entry) => entry.state === "rework").length;

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <section className="relative isolate overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(52,211,153,0.12),transparent_18%),linear-gradient(180deg,rgba(4,7,20,0.92),rgba(4,7,20,0.74)_54%,rgba(4,7,20,1))]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.28),transparent_36%,rgba(15,23,42,0.46))]" />

        <div className="relative mx-auto flex w-full max-w-[1380px] flex-col gap-10 px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-100">
              <span>{patchDetail.patch.versionLabel}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
              <span>{patchDetail.patch.publishedAt}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
              <span>{patchDetail.civilizations.length} civilta</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-200" />
              <span>{archive.length} patch disponibili</span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              Patch notes di Age of Empires IV
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300/86 sm:text-lg">
              Scegli una patch, apri la civilta che ti interessa e leggi subito le note
              ufficiali dedicate a quel popolo.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="cinematic-button-secondary">
                Torna alla home
              </Link>
              <a href="#civ-notes" className="cinematic-button-primary">
                Vai alle civilta
              </a>
              <a
                href={patchDetail.patch.url}
                target="_blank"
                rel="noreferrer"
                className="cinematic-button-ghost"
              >
                Apri fonte ufficiale
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="cinematic-stat-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/82">
                 Patch selezionata
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                {patchDetail.patch.versionLabel}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300/76">
                 Pubblicata il {patchDetail.patch.publishedAt}.
              </p>
            </div>

            <div className="cinematic-stat-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-200/82">
                Buff
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                {buffCount}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300/76">
                 Civilta con miglioramenti in questa patch.
              </p>
            </div>

            <div className="cinematic-stat-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/82">
                Nerf
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                {nerfCount}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300/76">
                 Civilta con riduzioni o indebolimenti in questa patch.
              </p>
            </div>

            <div className="cinematic-stat-card p-5 md:col-span-3 xl:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/82">
                 Rework / Altro
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                {reworkCount}
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300/76">
                 Civilta ritoccate, ribilanciate o non citate nelle note dedicate.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1380px] px-4 pt-10 sm:px-6 lg:px-10">
        <div className="cinematic-panel-soft p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="cinematic-kicker">Patch Archive</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                Scegli la patch da visualizzare
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-300/78">
               Scegli la patch che vuoi consultare. In questo momento stai guardando{" "}
               <span className="font-semibold text-white">{patchDetail.patch.title}</span>.
            </p>
          </div>

          <form action={selectPatch} className="mt-6 max-w-2xl">
            <label
              htmlFor="patch-selector"
              className="mb-3 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-100/78"
            >
              Seleziona patch
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                id="patch-selector"
                name="patch"
                defaultValue={patchDetail.patch.slug}
                className="cinematic-input min-h-[3.6rem] flex-1 appearance-none pr-4"
              >
                {archive.map((item) => (
                  <option key={item.slug} value={item.slug} className="bg-slate-950 text-slate-100">
                    {item.versionLabel} - {item.publishedAt}
                  </option>
                ))}
              </select>
              <button type="submit" className="cinematic-button-primary">
                Apri patch
              </button>
            </div>
          </form>
        </div>
      </section>

      <section id="civ-notes" className="mx-auto w-full max-w-[1380px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="cinematic-kicker">Civilization Breakdown</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
               {patchDetail.patch.versionLabel}: civilta e modifiche principali
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            {(["buff", "rework", "nerf"] as const).map((state) => {
              const config = patchBannerStateConfig[state];

              return (
                <div
                  key={state}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 ${config.badge}`}
                >
                  <PatchStateIcon state={state} />
                  <span>{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {patchDetail.civilizations.map((entry) => {
            const config = patchBannerStateConfig[entry.state];

            return (
              <details
                key={entry.id}
                className="group cinematic-panel-soft overflow-hidden border-white/10 open:border-amber-200/26 open:bg-[linear-gradient(180deg,rgba(14,20,38,0.92),rgba(7,11,24,0.86))]"
              >
                <summary className="list-none cursor-pointer">
                  <div className="relative overflow-hidden">
                    <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${config.accent}`} />
                    <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:px-6 lg:py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-slate-950/70 shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
                          <Image
                            src={entry.bannerSrc}
                            alt={`${entry.name} banner`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">
                              {entry.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${config.badge}`}
                            >
                              <PatchStateIcon state={entry.state} />
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {entry.hasOfficialEntry ? (
                        <div className="hidden lg:block" />
                      ) : (
                        <p className="max-w-2xl text-sm leading-7 text-slate-300/78">
                           Nessuna nota dedicata a questa civilta in questa patch.
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
                        <div
                          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${config.glow}`}
                        >
                          <PatchStateIcon state={entry.state} />
                        </div>
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300/70">
                          Apri dettagli
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-4 w-4 transition duration-300 group-open:rotate-180"
                          >
                            <path
                              d="m6 9 6 6 6-6"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.2"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </summary>

                <div className="border-t border-white/8 px-4 pb-5 pt-5 sm:px-5 lg:px-6">
                  <div className="cinematic-card-grid p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-100/80">
                       Note ufficiali
                    </p>
                    <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-300/84">
                      {entry.officialText.map((line) => (
                        <li key={line} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200/90" />
                          <span>{normalizePatchDisplayLine(line)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </main>
  );
}
