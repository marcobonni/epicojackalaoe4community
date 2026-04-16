"use client";

import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslations } from "@/app/components/LanguageProvider";

export default function FooterSection() {
  const messages = useTranslations();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6">
        <LanguageSwitcher />
        <p>{messages.home.footer}</p>
      </div>
    </footer>
  );
}
