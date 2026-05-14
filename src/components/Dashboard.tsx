import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, Trash2, MessageCircle } from "lucide-react";
import { AddictionIcon } from "@/components/AddictionIcon";
import type { AddictionRecord } from "@/types/addiction";
import { getAddictionConfig } from "@/config/addictions";
import { useLanguage } from "@/i18n/LanguageContext";
import { useChatNotifications } from "@/hooks/ChatNotificationsContext";

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcElapsed(quitDate: string): TimeElapsed {
  const diff = Math.max(0, Date.now() - new Date(quitDate).getTime());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}
const pad = (n: number) => String(n).padStart(2, "0");

interface DashboardProps {
  records: AddictionRecord[];
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

const Dashboard = ({ records, onSelect, onAdd, onRemove }: DashboardProps) => {
  const { t } = useLanguage();
  const [now, setNow] = useState(Date.now());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-12">
        <div className="pt-10 pb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">MyAddiction</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.dashboardSubtitle}</p>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {records.map((record, i) => {
              const config = getAddictionConfig(record.type);
              const elapsed = calcElapsed(record.quitDate);
              const label = (t as any)[config.counterLabelKey] || config.counterLabelKey;

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05, duration: 0.35, ease: [0.2, 0, 0, 1] }}
                  className="card-elevated overflow-hidden"
                >
                  <button
                    onClick={() => onSelect(record.id)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
                        <AddictionIcon typeId={config.id} size="lg" className="text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {(t as any)[config.labelKey] || config.labelKey}
                        </p>
                        <p className="font-mono-tabular text-xs text-muted-foreground mt-0.5">
                          {elapsed.days}d {pad(elapsed.hours)}h {pad(elapsed.minutes)}m {pad(elapsed.seconds)}s
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Inline delete confirmation */}
                  <AnimatePresence>
                    {confirmDelete === record.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="flex items-center justify-between px-5 py-3 bg-secondary">
                          <p className="text-xs text-muted-foreground">{t.removeAddiction}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="rounded-xl bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={() => { onRemove(record.id); setConfirmDelete(null); }}
                              className="rounded-xl bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground"
                            >
                              {t.yesReset}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {confirmDelete !== record.id && (
                    <div className="flex justify-end px-5 pb-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(record.id); }}
                        className="text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add addiction button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: records.length * 0.05 + 0.1 }}
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-dashed border-border py-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            {t.addAddiction}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
