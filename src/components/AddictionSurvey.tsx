import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { AddictionIcon } from "@/components/AddictionIcon";
import { useLanguage } from "@/i18n/LanguageContext";
import { ADDICTION_TYPES } from "@/config/addictions";
import type { AddictionTypeId, AddictionCategory } from "@/types/addiction";

export interface SurveyAnswers {
  addictionType: AddictionTypeId;
  quitMethod: string;
  usageLevel: string;
  usageDuration: string;
  biggestTrigger: string;
}

interface AddictionSurveyProps {
  onComplete: (answers: SurveyAnswers) => void;
  onBack: () => void;
}

const CATEGORY_ORDER: { key: AddictionCategory; labelKey: string }[] = [
  { key: "tobacco", labelKey: "catTobacco" },
  { key: "alcohol", labelKey: "catAlcohol" },
  { key: "substance", labelKey: "catSubstance" },
  { key: "behavioral", labelKey: "catBehavioral" },
];

const AddictionSurvey = ({ onComplete, onBack }: AddictionSurveyProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    addictionType: "" as AddictionTypeId,
    quitMethod: "",
    usageLevel: "",
    usageDuration: "",
    biggestTrigger: "",
  });

  const selectedConfig = ADDICTION_TYPES.find(a => a.id === answers.addictionType);
  const isTobacco = selectedConfig?.category === "tobacco";

  // Build quit method options based on category
  const getMethodOptions = () => {
    const base = [
      { key: "cold_turkey", emoji: "🚫", label: t.surveyMethodColdTurkey, desc: t.surveyMethodColdTurkeyDesc },
      { key: "reduction", emoji: "📉", label: t.surveyMethodReduction, desc: t.surveyMethodReductionDesc },
      { key: "willpower", emoji: "💪", label: t.surveyMethodWillpower, desc: t.surveyMethodWillpowerDesc },
      { key: "therapy", emoji: "🧠", label: t.surveyMethodTherapy, desc: t.surveyMethodTherapyDesc },
    ];
    if (isTobacco) {
      return [
        base[0],
        { key: "patches", emoji: "🩹", label: t.surveyMethodPatches, desc: t.surveyMethodPatchesDesc },
        { key: "gum", emoji: "🫧", label: t.surveyMethodGum, desc: t.surveyMethodGumDesc },
        { key: "spray", emoji: "💧", label: t.surveyMethodSpray, desc: t.surveyMethodSprayDesc },
        ...base.slice(1),
      ];
    }
    return base;
  };

  const triggerOptions = [
    { key: "stress", emoji: "😰", label: t.surveyTriggerStress },
    { key: "social", emoji: "🍻", label: t.surveyTriggerSocial },
    { key: "boredom", emoji: "😴", label: t.surveyTriggerBoredom },
    { key: "habit", emoji: "🔄", label: t.surveyTriggerHabit },
    { key: "loneliness", emoji: "🫂", label: t.surveyTriggerLoneliness },
    { key: "reward", emoji: "🎉", label: t.surveyTriggerReward },
  ];

  const setAnswer = <K extends keyof SurveyAnswers>(key: K, value: SurveyAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const steps = [
    // Step 0: Pick addiction type
    {
      title: t.surveyPickAddiction,
      subtitle: t.surveyPickAddictionSubtitle,
      content: (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {CATEGORY_ORDER.map(cat => {
            const types = ADDICTION_TYPES.filter(a => a.category === cat.key);
            if (types.length === 0) return null;
            return (
              <div key={cat.key}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {(t as any)[cat.labelKey]}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {types.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswer("addictionType", opt.id)}
                      className={`rounded-xl px-2 py-2.5 text-[11px] font-medium transition-all ${
                        answers.addictionType === opt.id
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                          : "bg-secondary text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <AddictionIcon typeId={opt.id} size="sm" className="mx-auto mb-0.5" />
                      {(t as any)[opt.labelKey] || opt.labelKey}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ),
      isValid: !!answers.addictionType,
    },
    // Step 1: Quit method
    {
      title: t.surveyQuitMethodTitle,
      subtitle: t.surveyQuitMethodSubtitle,
      content: (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {getMethodOptions().map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAnswer("quitMethod", opt.key)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                answers.quitMethod === opt.key
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className={`text-xs ${answers.quitMethod === opt.key ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
      isValid: !!answers.quitMethod,
    },
    // Step 2: Usage level
    {
      title: t.surveyUsageLevelTitle,
      subtitle: t.surveyUsageLevelSubtitle,
      content: (
        <div className="space-y-2">
          {[
            { key: "light", emoji: "🟢", label: t.surveyUsageLight, desc: t.surveyUsageLightDesc },
            { key: "moderate", emoji: "🟡", label: t.surveyUsageModerate, desc: t.surveyUsageModerateDesc },
            { key: "heavy", emoji: "🔴", label: t.surveyUsageHeavy, desc: t.surveyUsageHeavyDesc },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAnswer("usageLevel", opt.key)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all ${
                answers.usageLevel === opt.key
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className={`text-xs ${answers.usageLevel === opt.key ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ),
      isValid: !!answers.usageLevel,
    },
    // Step 3: Duration + Trigger
    {
      title: t.surveyTriggerTitle,
      subtitle: t.surveyTriggerSubtitle,
      content: (
        <div className="space-y-5">
          {/* Duration */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t.surveyDurationTitle}</p>
            <div className="space-y-1.5">
              {[
                { key: "months", label: t.surveyDurationMonths },
                { key: "1to5", label: t.surveyDuration1to5 },
                { key: "5to10", label: t.surveyDuration5to10 },
                { key: "10plus", label: t.surveyDuration10plus },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAnswer("usageDuration", opt.key)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium text-left transition-all ${
                    answers.usageDuration === opt.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Trigger */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">{t.surveyTriggerSubtitle}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {triggerOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAnswer("biggestTrigger", opt.key)}
                  className={`rounded-xl px-2 py-3 text-[11px] font-medium transition-all ${
                    answers.biggestTrigger === opt.key
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span className="block text-base mb-0.5">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
      isValid: !!answers.biggestTrigger && !!answers.usageDuration,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const totalSteps = steps.length;

  const handleNext = () => {
    if (isLast) {
      onComplete(answers);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="card-elevated p-6 sm:p-8 w-full max-w-sm">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : onBack())}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.back}
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-xl font-semibold text-foreground mb-1 text-center">{current.title}</h1>
            <p className="text-sm text-muted-foreground mb-5 text-center">{current.subtitle}</p>
            {current.content}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNext}
          disabled={!current.isValid}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isLast ? (
            <>
              <Sparkles className="h-4 w-4" />
              {t.surveyDone}
            </>
          ) : (
            <>
              {t.surveyNext}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Step count */}
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          {step + 1} / {totalSteps}
        </p>
      </div>
    </motion.div>
  );
};

export default AddictionSurvey;
