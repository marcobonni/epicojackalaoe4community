import BeastyPage from "./BeastyClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Age of Empires 4 - Sfida i tuoi amici",
  description:
    "Gioca al quiz AoE4 online con oltre 1000 domande. Sfida i tuoi amici in tempo reale.",
};

export default function Page() {
  return <BeastyPage />;
}