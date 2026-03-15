import { useState, useEffect } from "react";
import LiveCounter from "@/components/LiveCounter";
import HealthMilestones from "@/components/HealthMilestones";
import StatsBar from "@/components/StatsBar";
import QuitDatePicker from "@/components/QuitDatePicker";
import ResetConfirmation from "@/components/ResetConfirmation";
import PatchTracker from "@/components/PatchTracker";

const STORAGE_KEY = "quit-smoking-date";

const Index = () => {
  const [quitDate, setQuitDate] = useState<Date | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Date(stored) : null;
  });

  const [hoursElapsed, setHoursElapsed] = useState(0);

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
    setQuitDate(null);
    setHoursElapsed(0);
  };

  if (!quitDate) {
    return <QuitDatePicker onDateSet={handleDateSet} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12">
        {/* Counter Section — upper third */}
        <div className="flex flex-col items-center justify-center pt-16 pb-8">
          <LiveCounter quitDate={quitDate} />
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsBar
            hoursElapsed={hoursElapsed}
            cigarettesPerDay={20}
            pricePerPack={10}
            cigarettesPerPack={20}
          />
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
