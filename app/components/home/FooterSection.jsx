"use client";

import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslations } from "@/app/components/LanguageProvider";

export default function FooterSection() {
  const messages = useTranslations();

  return (
    <footer className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(3,6,17,0),rgba(3,6,17,0.88))] py-10 text-center text-xs text-slate-400">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-6 px-6">
        <div className="h-px w-full max-w-xl bg-gradient-to-r from-transparent via-amber-200/36 to-transparent" />
        <LanguageSwitcher />
        <p className="max-w-2xl text-[11px] uppercase tracking-[0.24em] text-slate-400/78">
          {messages.home.footer}
        </p>
      </div>
    </footer>
  );
}
