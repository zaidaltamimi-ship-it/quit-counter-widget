import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import type { AddictionRecord } from "@/types/addiction";
import { getAddictionConfig } from "@/config/addictions";
import { useLanguage } from "@/i18n/LanguageContext";
import LiveCounter from "@/components/LiveCounter";
import HealthMilestones from "@/components/HealthMilestones";
import HealthLogForm from "@/components/HealthLogForm";
import HealthCharts from "@/components/HealthCharts";
import PatchTracker from "@/components/PatchTracker";
import MoodLog from "@/components/MoodLog";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface AddictionDetailProps {
  record: AddictionRecord;
  onBack: () => void;
  onUpdate: (updates: Partial<AddictionRecord>) => void;
}

const AddictionDetail = ({ record, onBack, onUpdate }: AddictionDetailProps) => {
  const { t } = useLanguage();
  const config = getAddictionConfig(record.type);
  const [hoursElapsed, setHoursElapsed] = useState(0);

  useEffect(() => {
    const quitDate = new Date(record.quitDate);
    const update = () => setHoursElapsed((Date.now() - quitDate.getTime()) / 3600000);
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [record.quitDate]);

  const daysElapsed = hoursElapsed / 24;
  const unitsAvoided = Math.floor(daysElapsed * record.perDay);
  const moneySaved = daysElapsed * record.perDay * record.pricePerUnit;
  const caloriesSaved = unitsAvoided * config.caloriesPerUnit;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.back}
          </button>
          <LanguageSwitcher />
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center justify-center pt-8 pb-8">
          <LiveCounter quitDate={new Date(record.quitDate)} typeId={record.type} />
        </div>

        {/* Stats */}
        <div className="card-elevated p-5 mb-6">
          <div className={`grid ${caloriesSaved > 0 ? "grid-cols-3" : "grid-cols-2"} gap-4`}>
            <StatItem label={(t as any)[config.unitLabelKey] || "Avoided"} value={unitsAvoided.toLocaleString()} />
            <StatItem label={t.moneySaved} value={`$${moneySaved.toFixed(2)}`} />
            {caloriesSaved > 0 && (
              <StatItem label={t.caloriesSaved} value={caloriesSaved.toLocaleString()} />
            )}
          </div>
        </div>

        {/* Health Charts */}
        {record.healthEntries.length > 0 && (
          <div className="mb-6">
            <HealthCharts entries={record.healthEntries} quitDate={new Date(record.quitDate)} />
          </div>
        )}

        {/* Health Log */}
        <div className="card-elevated p-5 mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
            {t.healthLog}
          </p>
          <HealthLogForm
            entries={record.healthEntries}
            onEntriesChange={(entries) => onUpdate({ healthEntries: entries })}
          />
        </div>

        {/* Mood & Cravings Log */}
        <div className="mb-6">
          <MoodLog
            entries={record.moodEntries}
            onEntriesChange={(entries) => onUpdate({ moodEntries: entries })}
          />
        </div>

        {/* Patch Tracker (tobacco only) */}
        {config.showPatchTracker && (
          <div className="mb-6">
            <PatchTracker />
          </div>
        )}

        {/* Reduction Mode Stats (alcohol) */}
        {record.reductionMode && config.showReductionMode && (
          <ReductionTracker record={record} onUpdate={onUpdate} />
        )}

        {/* Health Milestones */}
        <HealthMilestones hoursElapsed={hoursElapsed} milestones={config.milestones} />
      </div>
    </div>
  );
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono-tabular text-xl font-semibold text-foreground">{value}</p>
      <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ReductionTracker({ record, onUpdate }: { record: AddictionRecord; onUpdate: (u: Partial<AddictionRecord>) => void }) {
  const { t } = useLanguage();
  const [drinks, setDrinks] = useState("");

  const currentWeek = new Date().toISOString().slice(0, 10);
  const thisWeekLog = record.weeklyLog?.find(w => w.week === currentWeek);

  const handleLog = () => {
    if (!drinks) return;
    const log = record.weeklyLog || [];
    const updated = log.filter(w => w.week !== currentWeek);
    updated.push({ week: currentWeek, actual: Number(drinks) });
    onUpdate({ weeklyLog: updated });
    setDrinks("");
  };

  return (
    <div className="card-elevated p-5 mb-6">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
        {t.reductionProgress}
      </p>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">{t.drinksToday}</p>
          <input
            type="number"
            min={0}
            value={drinks}
            onChange={e => setDrinks(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={handleLog}
          disabled={!drinks}
          className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
        >
          {t.log}
        </button>
      </div>
      {record.weeklyTarget && (
        <p className="text-xs text-muted-foreground">
          {t.weeklyGoal}: {record.weeklyTarget} {t.drinksPerWeek}
          {thisWeekLog && (
            <span className={thisWeekLog.actual <= record.weeklyTarget ? " text-primary" : " text-destructive"}>
              {" "}· {t.today}: {thisWeekLog.actual}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export default AddictionDetail;
