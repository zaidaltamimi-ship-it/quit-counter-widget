import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

interface ResetConfirmationProps {
  onReset: () => void;
}

const ResetConfirmation = ({ onReset }: ResetConfirmationProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const handleFirst = () => setStep(1);
  const handleCancel = () => setStep(0);
  const handleFinal = () => {
    onReset();
    setStep(0);
  };

  return (
    <div className="text-center">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.button
            key="reset"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleFirst}
            className="text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            {t.resetCounter}
          </motion.button>
        )}
        {step === 1 && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">{t.areYouSure}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCancel}
                className="rounded-[12px] bg-secondary px-4 py-2 text-xs font-medium text-muted-foreground"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleFinal}
                className="rounded-[12px] bg-muted-foreground/20 px-4 py-2 text-xs font-medium text-foreground"
              >
                {t.yesReset}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResetConfirmation;
