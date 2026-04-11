import { useLanguage } from "@/i18n/LanguageContext";
import type { Locale } from "@/i18n/translations";

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "cs", label: "CZ" },
  { code: "sk", label: "SK" },
  { code: "de", label: "DE" },
  { code: "es", label: "ES" },
  { code: "it", label: "IT" },
];

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex flex-wrap gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`rounded-[10px] px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
            locale === code
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
