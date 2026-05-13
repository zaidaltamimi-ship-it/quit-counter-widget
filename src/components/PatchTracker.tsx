import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const PATCH_STORAGE_KEY = "niquitin-patch-tracker";

interface PatchStep {
  step: number;
  labelKey: string;
  mg: number;
  durationWeeks: number;
  descKey: string;
}

const PATCH_STEPS: PatchStep[] = [
  { step: 1, labelKey: "step1", mg: 21, durationWeeks: 6, descKey: "fullStrength" },
  { step: 2, labelKey: "step2", mg: 14, durationWeeks: 2, descKey: "reducedStrength" },
  { step: 3, labelKey: "step3", mg: 7, durationWeeks: 2, descKey: "lowStrength" },
  { step: 4, labelKey: "step4", mg: 4, durationWeeks: 2, descKey: "lozenges" },
];

interface PatchState {
  active: boolean;
  currentStep: number;
  stepStartDate: string;
  notificationsEnabled: boolean;
}

function getStartingStep(): number {
  const perDay = Number(localStorage.getItem("quit-per-day")) || 20;
  if (perDay >= 20) return 1; // 21mg - heavy
  if (perDay >= 10) return 2; // 14mg - moderate
  return 3; // 7mg - light
}

function getDefaultState(): PatchState {
  return { active: false, currentStep: getStartingStep(), stepStartDate: new Date().toISOString(), notificationsEnabled: false };
}

function loadState(): PatchState {
  const stored = localStorage.getItem(PATCH_STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fallback */ }
  }
  return getDefaultState();
}

function saveState(state: PatchState) {
  localStorage.setItem(PATCH_STORAGE_KEY, JSON.stringify(state));
}

const PatchTracker = () => {
  const { t } = useLanguage();
  const [state, setState] = useState<PatchState>(loadState);
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { saveState(state); }, [state]);

  useEffect(() => {
    if (!state.active || !state.notificationsEnabled) return;
    const currentPatchStep = PATCH_STEPS.find(s => s.step === state.currentStep);
    if (!currentPatchStep) return;

    const stepStart = new Date(state.stepStartDate).getTime();
    const stepEnd = stepStart + currentPatchStep.durationWeeks * 7 * 24 * 3600000;
    const oneDayBefore = stepEnd - 24 * 3600000;

    if (now >= oneDayBefore && now < stepEnd && state.currentStep < 4) {
      const nextStep = PATCH_STEPS.find(s => s.step === state.currentStep + 1);
      if (nextStep && Notification.permission === "granted") {
        const notifKey = `patch-notif-step-${state.currentStep}`;
        if (!localStorage.getItem(notifKey)) {
          const nextLabel = (t as any)[nextStep.labelKey] as string;
          new Notification("Time to step down", {
            body: `Switch to ${nextLabel} (${nextStep.mg}mg) tomorrow.`,
            icon: "/icon-192.png",
          });
          localStorage.setItem(notifKey, "true");
        }
      }
    }
  }, [now, state, t]);

  const handleActivate = () => {
    const startStep = getStartingStep();
    setState(prev => ({ ...prev, active: true, currentStep: startStep, stepStartDate: new Date().toISOString() }));
  };

  const handleStepChange = (step: number) => {
    for (let i = 1; i <= 4; i++) localStorage.removeItem(`patch-notif-step-${i}`);
    setState(prev => ({ ...prev, currentStep: step, stepStartDate: new Date().toISOString() }));
  };

  const handleToggleNotifications = useCallback(async () => {
    if (!state.notificationsEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setState(prev => ({ ...prev, notificationsEnabled: true }));
        }
      }
    } else {
      setState(prev => ({ ...prev, notificationsEnabled: false }));
    }
  }, [state.notificationsEnabled]);

  const handleDeactivate = () => {
    for (let i = 1; i <= 3; i++) localStorage.removeItem(`patch-notif-step-${i}`);
    setState(getDefaultState());
  };

  const currentPatchStep = PATCH_STEPS.find(s => s.step === state.currentStep);
  const stepStart = new Date(state.stepStartDate).getTime();
  const stepDurationMs = currentPatchStep ? currentPatchStep.durationWeeks * 7 * 24 * 3600000 : 0;
  const stepProgress = stepDurationMs > 0 ? Math.min(1, (now - stepStart) / stepDurationMs) : 0;
  const daysRemaining = stepDurationMs > 0 ? Math.max(0, Math.ceil((stepStart + stepDurationMs - now) / 86400000)) : 0;
  const stepComplete = stepProgress >= 1;

  return (
    <div className="card-elevated overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex w-full items-center justify-between p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <span className="text-sm font-semibold text-accent-foreground">NRT</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{t.nicotinePatches}</p>
            <p className="text-xs text-muted-foreground">
              {state.active
                ? `${(t as any)[PATCH_STEPS[state.currentStep - 1].labelKey]} · ${currentPatchStep?.mg}mg`
                : t.notTracking}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {!state.active ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.trackPatchSchedule}
                  </p>
                  <button
                    onClick={handleActivate}
                    className="rounded-[16px] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {t.startPatchTracking}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    {PATCH_STEPS.map((ps) => {
                      const label = (t as any)[ps.labelKey] as string;
                      return (
                        <button
                          key={ps.step}
                          onClick={() => handleStepChange(ps.step)}
                          className={`flex-1 rounded-[12px] py-2.5 text-center transition-all ${
                            state.currentStep === ps.step
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="block text-xs font-medium">{ps.mg}mg</span>
                          <span className="block text-[0.6rem] uppercase tracking-wider mt-0.5 opacity-70">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {currentPatchStep && (
                    <div className="rounded-[16px] bg-secondary p-4 space-y-3">
                      <p className="text-xs text-muted-foreground">{(t as any)[currentPatchStep.descKey]}</p>

                      <div>
                        <div className="flex justify-between text-[0.65rem] uppercase tracking-widest text-muted-foreground mb-1.5">
                          <span>{currentPatchStep.durationWeeks} {t.weeksTotal}</span>
                          <span>{daysRemaining} {t.daysLeft}</span>
                        </div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm font-semibold text-foreground">
                            {Math.max(0, daysRemaining)} / {currentPatchStep.durationWeeks * 7} × {currentPatchStep.mg}mg
                          </span>
                          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                            {(t as any).patchesLabel}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            animate={{ width: `${stepProgress * 100}%` }}
                            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                          />
                        </div>
                      </div>

                      {stepComplete && state.currentStep < 3 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-[12px] bg-accent p-3"
                        >
                          <p className="text-xs font-medium text-accent-foreground">
                            {t.readyToMove(state.currentStep + 1, PATCH_STEPS[state.currentStep]?.mg)}
                          </p>
                        </motion.div>
                      )}
                      {stepComplete && state.currentStep === 3 && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-[12px] bg-accent p-3"
                        >
                          <p className="text-xs font-medium text-accent-foreground">
                            {t.programComplete}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleToggleNotifications}
                    className="flex w-full items-center justify-between rounded-[16px] bg-secondary px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {state.notificationsEnabled ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-foreground">{t.stepDownReminders}</span>
                    </div>
                    <div
                      className={`h-6 w-10 rounded-full p-0.5 transition-colors ${
                        state.notificationsEnabled ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <motion.div
                        className="h-5 w-5 rounded-full bg-primary-foreground shadow-sm"
                        animate={{ x: state.notificationsEnabled ? 16 : 0 }}
                        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                      />
                    </div>
                  </button>

                  <button
                    onClick={handleDeactivate}
                    className="text-xs font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors w-full text-center"
                  >
                    {t.stopPatchTracking}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatchTracker;
