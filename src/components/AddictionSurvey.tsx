import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface SurveyAnswers {
  quitMethod: string;
  usageLevel: string;
  usageDuration: string;
  biggestTrigger: string;
}

interface AddictionSurveyProps {
  onComplete: (answers: SurveyAnswers) => void;
  onBack: () => void;
}

const AddictionSurvey = ({ onComplete, onBack }: AddictionSurveyProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    quitMethod: "",
    usageLevel: "",
    usageDuration: "",
    biggestTrigger: "",
  });

  const methodOptions = [
    { key: "cold_turkey", emoji: "🚫", label: t.surveyMethodColdTurkey, desc: t.surveyMethodColdTurkeyDesc },
    { key: "patches", emoji: "🩹", label: t.surveyMethodPatches, desc: t.surveyMethodPatchesDesc },
    { key: "gum", emoji: "🫧", label: t.surveyMethodGum, desc: t.surveyMethodGumDesc },
    { key: "spray", emoji: "💧", label: t.surveyMethodSpray, desc: t.surveyMethodSprayDesc },
    { key: "reduction", emoji: "📉", label: t.surveyMethodReduction, desc: t.surveyMethodReductionDesc },
  ];

  const usageLevelOptions = [
    { key: "light", emoji: "🟢", label: t.surveyUsageLight, desc: t.surveyUsageLightDesc },
    { key: "moderate", emoji: "🟡", label: t.surveyUsageModerate, desc: t.surveyUsageModerateDesc },
    { key: "heavy", emoji: "🔴", label: t.surveyUsageHeavy, desc: t.surveyUsageHeavyDesc },
  ];

  const durationOptions = [
    { key: "months", label: t.surveyDurationMonths },
    { key: "1to5", label: t.surveyDuration1to5 },
    { key: "5to10", label: t.surveyDuration5to10 },
    { key: "10plus", label: t.surveyDuration10plus },
  ];

  const triggerOptions = [
    { key: "stress", emoji: "😰", label: t.surveyTriggerStress },
    { key: "social", emoji: "🍻", label: t.surveyTriggerSocial },
    { key: "boredom", emoji: "😴", label: t.surveyTriggerBoredom },
    { key: "habit", emoji: "🔄", label: t.surveyTriggerHabit },
  ];

  const setAnswer = <K extends keyof SurveyAnswers>(key: K, value: SurveyAnswers[K]) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const steps = [
    // Step 0: Quit method
    {
      title: t.surveyQuitMethodTitle,
      subtitle: t.surveyQuitMethodSubtitle,
      content: (
        <div className="space-y-2">
          {methodOptions.map((opt) => (
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
    // Step 1: Usage level
    {
      title: t.surveyUsageLevelTitle,
      subtitle: t.surveyUsageLevelSubtitle,
      content: (
        <div className="space-y-2">
          {usageLevelOptions.map((opt) => (
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
    // Step 2: Duration
    {
      title: t.surveyDurationTitle,
      subtitle: t.surveyDurationSubtitle,
      content: (
        <div className="space-y-2">
          {durationOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAnswer("usageDuration", opt.key)}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-medium text-left transition-all ${
                answers.usageDuration === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ),
      isValid: !!answers.usageDuration,
    },
    // Step 3: Trigger
    {
      title: t.surveyTriggerTitle,
      subtitle: t.surveyTriggerSubtitle,
      content: (
        <div className="grid grid-cols-2 gap-2">
          {triggerOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAnswer("biggestTrigger", opt.key)}
              className={`rounded-2xl px-3 py-4 text-xs font-medium transition-all ${
                answers.biggestTrigger === opt.key
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="block text-lg mb-1">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      ),
      isValid: !!answers.biggestTrigger,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

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
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="card-elevated p-8 w-full max-w-sm">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : onBack())}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.back}
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
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
            <p className="text-sm text-muted-foreground mb-6 text-center">{current.subtitle}</p>
            {current.content}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleNext}
          disabled={!current.isValid}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isLast ? (
            <>
              <Rocket className="h-4 w-4" />
              {t.surveyDone}
            </>
          ) : (
            <>
              {t.surveyNext}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default AddictionSurvey;
