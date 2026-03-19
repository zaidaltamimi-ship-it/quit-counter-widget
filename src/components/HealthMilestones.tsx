import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { MilestoneConfig } from "@/types/addiction";

interface HealthMilestonesProps {
  hoursElapsed: number;
  milestones: MilestoneConfig[];
}

const HealthMilestones = ({ hoursElapsed, milestones }: HealthMilestonesProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 px-1">
        {t.healthMilestones}
      </p>
      <div className="space-y-2">
        {milestones.map((milestone, i) => {
          const achieved = hoursElapsed >= milestone.time;
          const progress = achieved ? 1 : Math.min(1, hoursElapsed / milestone.time);
          const title = (t as any)[milestone.titleKey] as string;
          const desc = (t as any)[milestone.descKey] as string;
          return (
            <motion.div
              key={milestone.titleKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.2, 0, 0, 1] }}
              className="card-elevated p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                    achieved ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  {achieved && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${achieved ? "text-foreground" : "text-muted-foreground"}`}>
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  {!achieved && (
                    <div className="mt-2 h-1 w-full rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary/40"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthMilestones;
