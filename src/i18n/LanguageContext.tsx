import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface LanguageContextType {
  locale: Locale;
  t: (typeof translations)[Locale];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const SUPPORTED_LOCALES: Locale[] = ["en", "cs", "de", "es", "sk", "it"];

function matchLocale(tag: string | undefined | null): Locale | null {
  if (!tag) return null;
  const lower = tag.toLowerCase();
  for (const loc of SUPPORTED_LOCALES) {
    if (lower.startsWith(loc)) return loc;
  }
  return null;
}

function detectFromBrowser(): Locale {
  if (typeof navigator === "undefined") return "en";
  const candidates = [
    ...(navigator.languages ?? []),
    navigator.language,
  ];
  for (const c of candidates) {
    const m = matchLocale(c);
    if (m) return m;
  }
  return "en";
}

async function detectDeviceLocale(): Promise<Locale> {
  // Try native Capacitor Device API (iOS/Android) — fall back to browser.
  try {
    const isNative =
      typeof window !== "undefined" &&
      // @ts-ignore - Capacitor global injected on native runtime
      (window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      const { Device } = await import("@capacitor/device");
      const { value } = await Device.getLanguageCode();
      const matched = matchLocale(value);
      if (matched) return matched;
    }
  } catch {
    // ignore and fall back
  }
  return detectFromBrowser();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => detectFromBrowser());

  useEffect(() => {
    let active = true;
    detectDeviceLocale().then((l) => {
      if (active) setLocale(l);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
