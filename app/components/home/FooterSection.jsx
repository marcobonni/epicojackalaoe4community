"use client";

import { useTranslations } from "@/app/components/LanguageProvider";

export default function FooterSection() {
  const messages = useTranslations();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-400">
      {messages.home.footer}
    </footer>
  );
}
