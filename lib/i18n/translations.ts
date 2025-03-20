import { es } from "./languages/spanish";
import { en } from "./languages/english";
import { zh } from "./languages/chinese";
import { ru } from "./languages/russian";
import { fr } from "./languages/french";
import { hi } from "./languages/hindi";
import { bn } from "./languages/bengali";
import { ar } from "./languages/arabic";
import { pt } from "./languages/portuguese";

export const translations = {
  es,
  en,
  ru,
  fr,
  zh,
  hi,
  bn,
  ar,
  pt,
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

// To go :

// Urdu
// Swahili
// Indonesian
// Persian (Farsi)
// Hausa
// Punjabi
// Tamil
// Turkish
// Yoruba
// Igbo
// Amharic
// Vietnamese
// Thai
// Malay
// Somali
// Kurdish
// Zulu
// Xhosa
// Sinhala
// Nepali
// Filipino (Tagalog)
