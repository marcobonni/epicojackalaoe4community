import type { Metadata } from "next";
import { getOptionalSession } from "@/app/lib/session";
import { getRisikoMapData } from "./getRisikoMapData";
import { RisikoMapViewer } from "./RisikoMapViewer";

export const metadata: Metadata = {
  title: "Mappa Clan Wars Stile Risiko | AoE4 Italia Legacy",
  description:
    "Plancia Clan Wars esagonale con layer semi-trasparente e navigazione drag/zoom, pronta per una cartina reale dell'Italia sotto.",
};

export default async function ClanWarsRisikoPage() {
  const [mapData, session] = await Promise.all([getRisikoMapData(), getOptionalSession()]);

  return (
    <main className="min-h-screen bg-[#140f0b] text-[#f4e9d8]">
      <section className="relative overflow-hidden border-b border-[#f0d8ad]/10 bg-[radial-gradient(circle_at_top,_rgba(187,146,73,0.22),_rgba(20,15,11,0)_34%),linear-gradient(180deg,_#231810_0%,_#140f0b_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,231,200,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(246,231,200,0.05)_1px,transparent_1px)] bg-[size:34px_34px] opacity-15" />
        <div className="relative mx-auto max-w-[1800px] px-6 py-14 sm:px-8 lg:px-10 lg:py-18">
          <p className="text-sm uppercase tracking-[0.34em] text-[#d8ba79]">
            Clan Wars • Foxhole Hex Map
          </p>
          <h1 className="mt-5 max-w-6xl text-4xl font-semibold tracking-tight text-[#fbf4e7] sm:text-5xl lg:text-6xl">
            Una plancia esagonale pulita sopra cui possiamo appoggiare una vera mappa dell&apos;Italia.
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-[#dbcdb6] sm:text-lg">
            Ho tolto la finta sagoma della penisola e sono tornato a una griglia
            esagonale coerente, con drag e zoom. Adesso il layer strategico resta
            neutro e leggibile, mentre sotto puoi mettere una vera cartina italiana
            come base visiva senza forzare gli esagoni a imitare la geografia.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <RisikoMapViewer {...mapData} session={session} />
      </section>
    </main>
  );
}
