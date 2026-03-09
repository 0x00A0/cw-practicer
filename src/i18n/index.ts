import { createContext, useContext, type ReactNode } from "react";
import en, { type Locale } from "./en";
import zh from "./zh";
import sv from "./sv";
import { FlagGB, FlagCN, FlagSE } from "@/components/flags";

export type LangCode = "en" | "zh" | "sv";

export const locales: Record<LangCode, Locale> = { en, zh, sv };

export const langLabels: Record<LangCode, { flag: () => ReactNode; label: string }> = {
  en: { flag: () => FlagGB({ className: "inline-block" }), label: "English" },
  zh: { flag: () => FlagCN({ className: "inline-block" }), label: "中文" },
  sv: { flag: () => FlagSE({ className: "inline-block" }), label: "Svenska" },
};

/** Detect language from browser, return matching LangCode or fallback "en" */
export function detectLang(): LangCode {
  const langs = navigator.languages ?? [navigator.language];
  for (const raw of langs) {
    const code = raw.toLowerCase().split("-")[0];
    if (code in locales) return code as LangCode;
  }
  return "en";
}

export const I18nContext = createContext<Locale>(en);

export function useI18n(): Locale {
  return useContext(I18nContext);
}

export { type Locale };

