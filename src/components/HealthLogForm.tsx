import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Heart, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  initHealthKit,
  fetchHealthData,
  aggregateDaily,
  isHealthKitSupported,
} from "@/services/healthkit";
import { toast } from "sonner";

const STORAGE_KEY = "health-metrics-log";

export interface HealthEntry {
  id: string;
  date: string;
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  weight?: number;
  peakFlow?: number;
  note?: string;
}

function loadEntries(): HealthEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: HealthEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

interface HealthLogFormProps {
  onEntriesChange: (entries: HealthEntry[]) => void;
  entries: HealthEntry[];
}

const HealthLogForm = ({ onEntriesChange, entries }: HealthLogFormProps) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [heartRate, setHeartRate] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [weight, setWeight] = useState("");
  const [peakFlow, setPeakFlow] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const entry: HealthEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...(heartRate && { heartRate: Number(heartRate) }),
      ...(systolic && { systolic: Number(systolic) }),
      ...(diastolic && { diastolic: Number(diastolic) }),
      ...(weight && { weight: Number(weight) }),
      ...(peakFlow && { peakFlow: Number(peakFlow) }),
      ...(note && { note }),
    };
    const updated = [...entries, entry];
    saveEntries(updated);
    onEntriesChange(updated);
    resetForm();
  };

  const resetForm = () => {
    setHeartRate("");
    setSystolic("");
    setDiastolic("");
    setWeight("");
    setPeakFlow("");
    setNote("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    saveEntries(updated);
    onEntriesChange(updated);
  };

  const hasAnyValue = heartRate || systolic || diastolic || weight || peakFlow;
  const recentEntries = [...entries].reverse().slice(0, 3);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.button
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-secondary py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            {t.logTodaysHealth}
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-[16px] bg-secondary p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {t.newEntry}
                </p>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField label={t.heartRate} placeholder="bpm" value={heartRate} onChange={setHeartRate} />
                <InputField label={t.weight} placeholder="kg" value={weight} onChange={setWeight} />
                <InputField label={t.systolicBP} placeholder="mmHg" value={systolic} onChange={setSystolic} />
                <InputField label={t.diastolicBP} placeholder="mmHg" value={diastolic} onChange={setDiastolic} />
              </div>
              <InputField label={t.peakFlowLung} placeholder="L/min" value={peakFlow} onChange={setPeakFlow} fullWidth />
              <input
                type="text"
                placeholder={t.noteOptional}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full rounded-[12px] bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              />

              <button
                onClick={handleSubmit}
                disabled={!hasAnyValue}
                className="w-full rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {t.saveEntry}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {recentEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-[0.6rem] font-medium uppercase tracking-widest text-muted-foreground px-1">
            {t.recent}
          </p>
          {recentEntries.map((entry) => (
            <div key={entry.id} className="flex items-start justify-between rounded-[12px] bg-secondary px-3 py-2.5">
              <div className="space-y-0.5">
                <p className="text-[0.65rem] text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {entry.heartRate && <MiniStat label="HR" value={`${entry.heartRate}`} unit="bpm" />}
                  {entry.systolic && entry.diastolic && <MiniStat label="BP" value={`${entry.systolic}/${entry.diastolic}`} />}
                  {entry.weight && <MiniStat label="WT" value={`${entry.weight}`} unit="kg" />}
                  {entry.peakFlow && <MiniStat label="PF" value={`${entry.peakFlow}`} unit="L/m" />}
                </div>
                {entry.note && <p className="text-xs text-muted-foreground/70 mt-0.5">{entry.note}</p>}
              </div>
              <button onClick={() => handleDelete(entry.id)} className="mt-1 text-muted-foreground/40 hover:text-muted-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function InputField({ label, placeholder, value, onChange, fullWidth }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <label className="block text-[0.6rem] font-medium uppercase tracking-widest text-muted-foreground mb-1 px-1">
        {label}
      </label>
      <input
        type="number"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-[12px] bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <span className="text-xs text-foreground">
      <span className="text-muted-foreground/60">{label} </span>
      <span className="font-mono-tabular font-medium">{value}</span>
      {unit && <span className="text-muted-foreground/60 text-[0.6rem]"> {unit}</span>}
    </span>
  );
}

export { loadEntries, saveEntries };
export default HealthLogForm;
