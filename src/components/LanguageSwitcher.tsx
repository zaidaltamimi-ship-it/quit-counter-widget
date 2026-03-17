import { useLanguage } from "@/i18n/LanguageContext";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => setLocale("en")}
        className={`rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("cs")}
        className={`rounded-[10px] px-3 py-1.5 text-xs font-medium transition-colors ${
          locale === "cs"
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        CZ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
