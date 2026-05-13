import { useState, useEffect } from "react";
import { ArrowLeft, Pause, Play, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { AddictionRecord } from "@/types/addiction";
import { getAddictionConfig } from "@/config/addictions";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency, formatMoney } from "@/hooks/useCurrency";
import LiveCounter from "@/components/LiveCounter";
import HealthMilestones from "@/components/HealthMilestones";
import HealthLogForm from "@/components/HealthLogForm";
import HealthCharts from "@/components/HealthCharts";
import PatchTracker from "@/components/PatchTracker";
import MoodLog from "@/components/MoodLog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";


interface AddictionDetailProps {
  record: AddictionRecord;
  onBack: () => void;
  onUpdate: (updates: Partial<AddictionRecord>) => void;
  onAddSlip?: (kind: "continue" | "reset", note?: string) => void;
}

const AddictionDetail = ({ record, onBack, onUpdate, onAddSlip }: AddictionDetailProps) => {
  const { t } = useLanguage();
  const config = getAddictionConfig(record.type);
  const [hoursElapsed, setHoursElapsed] = useState(0);
  const [slipOpen, setSlipOpen] = useState(false);
  const [slipNote, setSlipNote] = useState("");

  const isPaused = !!record.pausedAt;
  const totalPaused = record.totalPausedMs || 0;

  useEffect(() => {
    const quitDate = new Date(record.quitDate).getTime();
    const update = () => {
      const end = isPaused ? new Date(record.pausedAt!).getTime() : Date.now();
      setHoursElapsed(Math.max(0, (end - quitDate - totalPaused) / 3600000));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [record.quitDate, record.pausedAt, totalPaused, isPaused]);

  const handlePauseToggle = () => {
    if (isPaused) {
      // Resume: add pause duration to total
      const pauseElapsed = Date.now() - new Date(record.pausedAt!).getTime();
      onUpdate({
        pausedAt: null,
        totalPausedMs: totalPaused + pauseElapsed,
      });
    } else {
      onUpdate({ pausedAt: new Date().toISOString() });
    }
  };

  const handleSlipContinue = () => {
    onAddSlip?.("continue", slipNote.trim() || undefined);
    setSlipNote("");
    setSlipOpen(false);
  };

  const handleSlipReset = () => {
    onAddSlip?.("reset", slipNote.trim() || undefined);
    onUpdate({
      quitDate: new Date().toISOString(),
      pausedAt: null,
      totalPausedMs: 0,
    });
    setSlipNote("");
    setSlipOpen(false);
  };

  const daysElapsed = hoursElapsed / 24;
  const monthsElapsed = daysElapsed / 30.4375;

  // Compute every possible stat — render only those declared in config.statKeys.
  const statValues: Record<string, { label: string; value: string }> = {
    unitsAvoided: {
      label: (t as any)[config.unitLabelKey] || "Avoided",
      value: Math.floor(daysElapsed * record.perDay).toLocaleString(),
    },
    moneySaved: {
      label: t.moneySaved,
      value: `$${(daysElapsed * record.perDay * record.pricePerUnit).toFixed(2)}`,
    },
    caloriesSaved: {
      label: t.caloriesSaved,
      value: Math.floor(daysElapsed * record.perDay * config.caloriesPerUnit).toLocaleString(),
    },
    hoursReclaimed: {
      label: (t as any)[config.unitLabelKey] || "Hours reclaimed",
      // perDay is hours/day for time-based behaviors
      value: Math.floor(daysElapsed * record.perDay).toLocaleString(),
    },
    moneyEstimate: {
      label: (t as any).moneyKept || t.moneySaved,
      // pricePerUnit holds monthly avg spend for perMonth pricing
      value: `$${Math.max(0, monthsElapsed * record.pricePerUnit).toFixed(2)}`,
    },
  };

  const visibleStats = config.statKeys
    .map(k => statValues[k])
    .filter(s => s && s.value !== "0" && s.value !== "$0.00");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.back}
          </button>
        </div>

        {/* Counter */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <LiveCounter
            quitDate={new Date(record.quitDate)}
            typeId={record.type}
            pausedAt={record.pausedAt ? new Date(record.pausedAt) : null}
            totalPausedMs={totalPaused}
          />
          {isPaused && (
            <p className="mt-3 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              {(t as any).pausedNotice || "Paused — your progress is safe"}
            </p>
          )}
          {config.streakOnly && !isPaused && (
            <p className="mt-3 text-[0.7rem] uppercase tracking-widest text-muted-foreground text-center max-w-[260px]">
              {(t as any).streakOnlyCaption || "One moment at a time. You're doing this."}
            </p>
          )}
        </div>

        {/* Pause / Slip actions */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={handlePauseToggle}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? ((t as any).resume || "Resume") : ((t as any).pause || "Pause")}
          </button>
          <button
            onClick={() => setSlipOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            <Heart className="h-4 w-4" />
            {(t as any).hadASlip || "Had a slip"}
          </button>
        </div>

        {/* Stats — only render when there are stats to show */}
        {visibleStats.length > 0 && (
          <div className="card-elevated p-5 mb-6">
            <div className={`grid gap-4 ${visibleStats.length === 1 ? "grid-cols-1" : visibleStats.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {visibleStats.map((s, i) => (
                <StatItem key={i} label={s.label} value={s.value} />
              ))}
            </div>
          </div>
        )}

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

        {/* Slips summary */}
        {record.slips && record.slips.length > 0 && (
          <div className="card-elevated p-4 mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
              {(t as any).slipsLogged || "Slips logged"}
            </p>
            <p className="text-sm text-foreground">
              {record.slips.length} ·{" "}
              <span className="text-muted-foreground">
                {(t as any).slipsKindMessage || "Every day you choose again is a win."}
              </span>
            </p>
          </div>
        )}

        {/* Health Milestones */}
        <HealthMilestones hoursElapsed={hoursElapsed} milestones={config.milestones} />
      </div>

      <Dialog open={slipOpen} onOpenChange={setSlipOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{(t as any).slipDialogTitle || "It's okay. You're human."}</DialogTitle>
            <DialogDescription>
              {(t as any).slipDialogDesc ||
                "A slip isn't a failure — it's information. Choose what feels right for you."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={slipNote}
            onChange={(e) => setSlipNote(e.target.value)}
            placeholder={(t as any).slipNotePlaceholder || "Optional: what triggered it?"}
            className="min-h-[80px]"
          />
          <DialogFooter className="flex flex-col sm:flex-col gap-2">
            <button
              onClick={handleSlipContinue}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {(t as any).slipKeepGoing || "I'm okay — keep my streak"}
            </button>
            <button
              onClick={handleSlipReset}
              className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              {(t as any).slipStartFresh || "Start fresh from today"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
