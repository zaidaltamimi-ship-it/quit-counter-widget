import { useState, useEffect } from "react";
import LiveCounter from "@/components/LiveCounter";
import HealthMilestones from "@/components/HealthMilestones";
import StatsBar from "@/components/StatsBar";
import QuitDatePicker from "@/components/QuitDatePicker";
import type { TobaccoType } from "@/components/QuitDatePicker";
import ResetConfirmation from "@/components/ResetConfirmation";
import PatchTracker from "@/components/PatchTracker";
import HealthLogForm, { loadEntries, type HealthEntry } from "@/components/HealthLogForm";
import HealthCharts from "@/components/HealthCharts";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

const STORAGE_KEY = "quit-smoking-date";

const Index = () => {
  const { t } = useLanguage();
  const [quitDate, setQuitDate] = useState<Date | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Date(stored) : null;
  });

  const [tobaccoType, setTobaccoType] = useState<TobaccoType>(() => {
    return (localStorage.getItem("quit-tobacco-type") as TobaccoType) || "cigarette";
  });

  const [perDay, setPerDay] = useState(() => {
    return Number(localStorage.getItem("quit-per-day")) || 20;
  });

  const [hoursElapsed, setHoursElapsed] = useState(0);
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>(loadEntries);

  useEffect(() => {
    if (!quitDate) return;
    const update = () => setHoursElapsed((Date.now() - quitDate.getTime()) / 3600000);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [quitDate]);

  const handleDateSet = (date: Date) => {
    localStorage.setItem(STORAGE_KEY, date.toISOString());
    setQuitDate(date);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("quit-tobacco-type");
    localStorage.removeItem("quit-per-day");
    setQuitDate(null);
    setHoursElapsed(0);
    setTobaccoType("cigarette");
    setPerDay(20);
  };

  if (!quitDate) {
    return <QuitDatePicker onDateSet={handleDateSet} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12">
        {/* Language Switcher */}
        <div className="flex justify-end pt-4">
          <LanguageSwitcher />
        </div>

        {/* Counter Section */}
        <div className="flex flex-col items-center justify-center pt-8 pb-8">
          <LiveCounter quitDate={quitDate} tobaccoType={tobaccoType} />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsBar
            hoursElapsed={hoursElapsed}
            cigarettesPerDay={perDay}
            pricePerPack={10}
            cigarettesPerPack={20}
            tobaccoType={tobaccoType}
          />
        </div>

        {/* Health Charts */}
        <div className="mb-6">
          <HealthCharts entries={healthEntries} quitDate={quitDate} />
        </div>

        {/* Health Log */}
        <div className="card-elevated p-5 mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
            {t.healthLog}
          </p>
          <HealthLogForm entries={healthEntries} onEntriesChange={setHealthEntries} />
        </div>

        {/* Patch Tracker */}
        <div className="mb-6">
          <PatchTracker />
        </div>

        {/* Health Milestones */}
        <HealthMilestones hoursElapsed={hoursElapsed} />

        {/* Reset */}
        <div className="mt-10 pb-8">
          <ResetConfirmation onReset={handleReset} />
        </div>
      </div>
    </div>
  );
};

export default Index;
