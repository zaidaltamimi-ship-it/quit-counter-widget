import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AddictionIcon } from "@/components/AddictionIcon";
import { ADDICTION_TYPES } from "@/config/addictions";
import type { AddictionRecord, AddictionTypeId } from "@/types/addiction";
import { useLanguage } from "@/i18n/LanguageContext";
import type { SurveyAnswers } from "@/components/AddictionSurvey";

interface AddictionOnboardingProps {
  onComplete: (record: AddictionRecord) => void;
  onBack: () => void;
  existingTypes: AddictionTypeId[];
  surveyAnswers?: SurveyAnswers | null;
}

const AddictionOnboarding = ({ onComplete, onBack, existingTypes, surveyAnswers }: AddictionOnboardingProps) => {
  const { t } = useLanguage();
  const preselected = surveyAnswers?.addictionType || null;
  const [selectedType, setSelectedType] = useState<AddictionTypeId | null>(preselected);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("12:00");
  const [perDay, setPerDay] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState("5");
  const [reductionMode, setReductionMode] = useState(false);
  const [weeklyTarget, setWeeklyTarget] = useState("7");

  // Apply survey defaults
  useEffect(() => {
    if (surveyAnswers) {
      if (surveyAnswers.quitMethod === "reduction") setReductionMode(true);
      if (surveyAnswers.usageLevel === "light") setPerDay(5);
      else if (surveyAnswers.usageLevel === "moderate") setPerDay(15);
      else if (surveyAnswers.usageLevel === "heavy") setPerDay(25);
    }
  }, [surveyAnswers]);

  const availableTypes = ADDICTION_TYPES.filter(a => !existingTypes.includes(a.id));
  const config = selectedType ? ADDICTION_TYPES.find(a => a.id === selectedType) : null;

  const handleTypeSelect = (typeId: AddictionTypeId) => {
    const cfg = ADDICTION_TYPES.find(a => a.id === typeId)!;
    setSelectedType(typeId);
    if (surveyAnswers?.usageLevel === "light") setPerDay(Math.min(cfg.defaultPerDay, 5));
    else if (surveyAnswers?.usageLevel === "moderate") setPerDay(Math.min(cfg.defaultPerDay, 15));
    else if (surveyAnswers?.usageLevel === "heavy") setPerDay(Math.max(cfg.defaultPerDay, 20));
    else setPerDay(cfg.defaultPerDay);
    setReductionMode(surveyAnswers?.quitMethod === "reduction");
  };

  // Auto-apply config when preselected
  useEffect(() => {
    if (preselected && !config) {
      handleTypeSelect(preselected);
    }
  }, [preselected]);

  const handleSubmit = () => {
    if (!selectedType || !dateStr || !config) return;
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    if (date > new Date()) return;

    const isTobacco = config.category === "tobacco";
    const record: AddictionRecord = {
      id: crypto.randomUUID(),
      type: selectedType,
      quitDate: date.toISOString(),
      perDay: config.streakOnly ? 0 : perDay,
      pricePerUnit: config.streakOnly ? 0 : Number(pricePerUnit) / (isTobacco ? 20 : 1),
      unitsPerPack: isTobacco ? 20 : 1,
      createdAt: new Date().toISOString(),
      healthEntries: [],
      moodEntries: [],
      reductionMode: reductionMode && config.showReductionMode,
      weeklyTarget: reductionMode ? Number(weeklyTarget) : undefined,
      weeklyLog: [],
    };
    onComplete(record);
  };

  const getPriceLabel = () => {
    if (!config) return t.pricePerUnit;
    if (config.pricePeriod === "perMonth") return (t as any).monthlySpend || t.pricePerUnit;
    if (config.category === "tobacco") return t.pricePerPack;
    if (config.id === "alcohol") return t.pricePerDrink;
    return t.pricePerUnit;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="card-elevated p-6 sm:p-8 w-full max-w-sm">
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.back}
        </button>

        <h1 className="text-xl font-semibold text-foreground mb-2 text-center">{t.addAddiction}</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">{t.chooseWhatToTrack}</p>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-1.5 mb-6 max-h-[30vh] overflow-y-auto">
          {availableTypes.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleTypeSelect(opt.id)}
              className={`rounded-xl px-2 py-2.5 text-[11px] font-medium transition-all ${
                selectedType === opt.id
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              <AddictionIcon typeId={opt.id} size="sm" className="mx-auto mb-0.5" />
              {(t as any)[opt.labelKey] || opt.labelKey}
            </button>
          ))}
        </div>

        {selectedType && config && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 overflow-hidden"
          >
            {/* Per day input */}
            {config.showPerDay && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  {(t as any)[config.unitLabelKey]?.split(" ")[0] || "Units"} — {t.perDay}
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={perDay}
                  onChange={(e) => setPerDay(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {/* Price — only for types that track money */}
            {config.statKeys.includes("moneySaved") && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  {getPriceLabel()}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {/* Reduction mode */}
            {config.showReductionMode && (
              <div className="rounded-2xl bg-secondary p-4 space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t.reductionMode}</span>
                  <button
                    onClick={() => setReductionMode(!reductionMode)}
                    className={`h-6 w-10 rounded-full p-0.5 transition-colors ${
                      reductionMode ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <motion.div
                      className="h-5 w-5 rounded-full bg-primary-foreground shadow-sm"
                      animate={{ x: reductionMode ? 16 : 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                </label>
                <p className="text-xs text-muted-foreground">{t.reductionModeDesc}</p>
                {reductionMode && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t.weeklyTarget}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={weeklyTarget}
                      onChange={(e) => setWeeklyTarget(e.target.value)}
                      className="w-full rounded-xl bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Date & time */}
            <div className="space-y-3">
              <input
                type="date"
                value={dateStr}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!dateStr}
              className="w-full rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {t.startTracking}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AddictionOnboarding;
