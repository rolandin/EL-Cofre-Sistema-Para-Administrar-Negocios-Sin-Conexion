"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Language } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  const { data: settings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings/system");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
  });

  useEffect(() => {
    if (settings?.language) {
      setLanguage(settings.language);
      document.documentElement.lang = settings.language;
    }
  }, [settings?.language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
