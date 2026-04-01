"use client";

import { translations, type TranslationKey } from "./translations";
import { useLanguage } from "./language-provider";

export function useTranslations() {
  const { language } = useLanguage();
  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let translation = translations[language][key];
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        translation = translation.replace(`{${key}}`, String(value));
      });
    }
    return translation;
  };

  return { t, language };
}
