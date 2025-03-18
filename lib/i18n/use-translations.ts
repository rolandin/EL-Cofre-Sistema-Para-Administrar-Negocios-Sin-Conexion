"use client";

import { translations, type TranslationKey } from "./translations";
import { useLanguage } from "./language-provider";

export function useTranslations() {
  const { language } = useLanguage();
  const t = (key: TranslationKey) => translations[language][key];

  return { t, language };
}
