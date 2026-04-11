import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)[Locale];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "quit-counter-locale";
const SUPPORTED_LOCALES: Locale[] = ["en", "cs", "de", "es", "sk", "it"];

function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY) as Locale;
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;

  const browserLang = navigator.language.toLowerCase();
  for (const loc of SUPPORTED_LOCALES) {
    if (browserLang.startsWith(loc)) return loc;
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLocaleState(l);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
