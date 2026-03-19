import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { MoodEntry } from "@/types/addiction";
import { useLanguage } from "@/i18n/LanguageContext";

interface MoodLogProps {
  entries: MoodEntry[];
  onEntriesChange: (entries: MoodEntry[]) => void;
}

const MOOD_EMOJIS = ["😫", "😟", "😐", "🙂", "😊"];
const CRAVING_LABELS = ["💀", "🔥", "😤", "😌", "✨"];

const MoodLog = ({ entries, onEntriesChange }: MoodLogProps) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState(3);
  const [craving, setCraving] = useState(3);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mood,
      craving,
      ...(note && { note }),
    };
    onEntriesChange([...entries, entry]);
    setMood(3);
    setCraving(3);
    setNote("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onEntriesChange(entries.filter(e => e.id !== id));
  };

  const recent = [...entries].reverse().slice(0, 5);

  return (
    <div className="card-elevated p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
        {t.moodCravings}
      </p>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.button
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            {t.logMoodToday}
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-secondary p-4 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t.howAreYou}</p>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Mood slider */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t.moodLabel}</p>
                <div className="flex justify-between">
                  {MOOD_EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setMood(i + 1)}
                      className={`text-2xl transition-all ${mood === i + 1 ? "scale-125" : "opacity-40 hover:opacity-70"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Craving slider */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">{t.cravingLabel}</p>
                <div className="flex justify-between">
                  {CRAVING_LABELS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setCraving(5 - i)}
                      className={`text-2xl transition-all ${craving === 5 - i ? "scale-125" : "opacity-40 hover:opacity-70"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder={t.noteOptional}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full rounded-xl bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              />

              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t.saveEntry}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {recent.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[0.6rem] font-medium uppercase tracking-widest text-muted-foreground px-1">{t.recent}</p>
          {recent.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-lg">{MOOD_EMOJIS[entry.mood - 1]}</span>
                <div>
                  <p className="text-[0.65rem] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-xs text-foreground">
                    {t.cravingLevel}: {entry.craving}/5
                    {entry.note && <span className="text-muted-foreground/70"> · {entry.note}</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(entry.id)} className="text-muted-foreground/40 hover:text-muted-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodLog;
