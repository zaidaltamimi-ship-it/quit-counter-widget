import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Milestone {
  time: number; // hours
  title: string;
  description: string;
}

const MILESTONES: Milestone[] = [
  { time: 0.33, title: "Heart rate drops", description: "Your heart rate begins to return to normal." },
  { time: 8, title: "Oxygen normalizes", description: "Carbon monoxide levels in your blood drop by half." },
  { time: 24, title: "Heart attack risk drops", description: "Your risk of heart attack begins to decrease." },
  { time: 48, title: "Nerve endings regrow", description: "Your sense of taste and smell start to improve." },
  { time: 72, title: "Breathing improves", description: "Your bronchial tubes begin to relax. Lung capacity increases." },
  { time: 336, title: "Circulation restored", description: "Blood circulation has significantly improved." },
  { time: 2160, title: "Coughing decreases", description: "Lung function increases up to 30%." },
  { time: 8760, title: "Risk halved", description: "Heart disease risk is now half that of a smoker." },
  { time: 43800, title: "Lung cancer risk halved", description: "Risk of lung cancer drops to half that of a smoker." },
  { time: 87600, title: "Risk normalized", description: "Heart disease risk is now the same as a non-smoker." },
];

interface HealthMilestonesProps {
  hoursElapsed: number;
}

const HealthMilestones = ({ hoursElapsed }: HealthMilestonesProps) => {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 px-1">
        Health milestones
      </p>
      <div className="space-y-2">
        {MILESTONES.map((milestone, i) => {
          const achieved = hoursElapsed >= milestone.time;
          const progress = achieved ? 1 : Math.min(1, hoursElapsed / milestone.time);
          return (
            <motion.div
              key={milestone.title}
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
                    {milestone.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
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
