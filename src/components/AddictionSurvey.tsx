import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface SurveyAnswers {
  motivation: string;
  readiness: number;
  pastAttempts: string;
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
    motivation: "",
    readiness: 5,
    pastAttempts: "",
    biggestTrigger: "",
  });

  const motivationOptions = [
    { key: "health", emoji: "❤️", label: t.surveyHealthReason },
    { key: "money", emoji: "💰", label: t.surveyMoneyReason },
    { key: "family", emoji: "👨‍👩‍👧", label: t.surveyFamilyReason },
    { key: "self", emoji: "💪", label: t.surveySelfReason },
  ];

  const triggerOptions = [
    { key: "stress", emoji: "😰", label: t.surveyTriggerStress },
    { key: "social", emoji: "🍻", label: t.surveyTriggerSocial },
    { key: "boredom", emoji: "😴", label: t.surveyTriggerBoredom },
    { key: "habit", emoji: "🔄", label: t.surveyTriggerHabit },
  ];

  const pastAttemptOptions = [
    { key: "never", label: t.surveyNever },
    { key: "once", label: t.surveyOnce },
    { key: "few", label: t.surveyFewTimes },
    { key: "many", label: t.surveyManyTimes },
  ];

  const steps = [
    // Step 0: Motivation
    {
      title: t.surveyMotivationTitle,
      subtitle: t.surveyMotivationSubtitle,
      content: (
        <div className="grid grid-cols-2 gap-2">
          {motivationOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAnswers({ ...answers, motivation: opt.key })}
              className={`rounded-2xl px-3 py-4 text-xs font-medium transition-all ${
                answers.motivation === opt.key
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
      isValid: !!answers.motivation,
    },
    // Step 1: Readiness (1-10 scale)
    {
      title: t.surveyReadinessTitle,
      subtitle: t.surveyReadinessSubtitle,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t.surveyNotReady}</span>
            <span>{t.surveyVeryReady}</span>
          </div>
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAnswers({ ...answers, readiness: n })}
                className={`h-10 w-8 rounded-xl text-xs font-semibold transition-all ${
                  answers.readiness === n
                    ? "bg-primary text-primary-foreground scale-110"
                    : answers.readiness > n
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-center text-2xl font-bold text-foreground">{answers.readiness}/10</p>
        </div>
      ),
      isValid: true,
    },
    // Step 2: Past attempts
    {
      title: t.surveyPastAttemptsTitle,
      subtitle: t.surveyPastAttemptsSubtitle,
      content: (
        <div className="space-y-2">
          {pastAttemptOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAnswers({ ...answers, pastAttempts: opt.key })}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-medium text-left transition-all ${
                answers.pastAttempts === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ),
      isValid: !!answers.pastAttempts,
    },
    // Step 3: Biggest trigger
    {
      title: t.surveyTriggerTitle,
      subtitle: t.surveyTriggerSubtitle,
      content: (
        <div className="grid grid-cols-2 gap-2">
          {triggerOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAnswers({ ...answers, biggestTrigger: opt.key })}
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
              <CheckCircle2 className="h-4 w-4" />
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
