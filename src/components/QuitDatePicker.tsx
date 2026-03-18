import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface QuitDatePickerProps {
  onDateSet: (date: Date) => void;
}

export type TobaccoType = "cigarette" | "vape" | "iqos";

const QuitDatePicker = ({ onDateSet }: QuitDatePickerProps) => {
  const { t } = useLanguage();
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("12:00");
  const [tobaccoType, setTobaccoType] = useState<TobaccoType>("cigarette");
  const [perDay, setPerDay] = useState(20);

  const tobaccoOptions: { value: TobaccoType; label: string; emoji: string }[] = [
    { value: "cigarette", label: t.cigarette, emoji: "🚬" },
    { value: "vape", label: t.vape, emoji: "💨" },
    { value: "iqos", label: t.iqos, emoji: "🔥" },
  ];

  const showPerDay = tobaccoType === "cigarette" || tobaccoType === "iqos";

  const handleSubmit = () => {
    if (!dateStr) return;
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    if (date <= new Date()) {
      localStorage.setItem("quit-tobacco-type", tobaccoType);
      if (showPerDay) {
        localStorage.setItem("quit-per-day", String(perDay));
      }
      onDateSet(date);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="absolute top-4 right-6">
        <LanguageSwitcher />
      </div>
      <div className="card-elevated p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {t.whenLastCigarette}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t.setDateToStart}
        </p>

        {/* Tobacco type selector */}
        <div className="flex gap-2 mb-6">
          {tobaccoOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTobaccoType(opt.value)}
              className={`flex-1 rounded-[16px] px-3 py-3 text-xs font-medium transition-all ${
                tobaccoType === opt.value
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="block text-lg mb-0.5">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Per day input */}
        {showPerDay && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-muted-foreground mb-2 text-left">
              {tobaccoType === "cigarette" ? t.cigarettesAvoided.split(" ")[0] : t.sticksAvoided.split(" ")[0]} — {t.perDay}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={perDay}
              onChange={(e) => setPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-[16px] bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        <div className="space-y-3 mb-8">
          <input
            type="date"
            value={dateStr}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-[16px] bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="w-full rounded-[16px] bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!dateStr}
          className="w-full rounded-[16px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t.startTracking}
        </button>
      </div>
    </motion.div>
  );
};

export default QuitDatePicker;
