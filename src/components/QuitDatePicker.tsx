import { useState } from "react";
import { motion } from "framer-motion";

interface QuitDatePickerProps {
  onDateSet: (date: Date) => void;
}

const QuitDatePicker = ({ onDateSet }: QuitDatePickerProps) => {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("12:00");

  const handleSubmit = () => {
    if (!dateStr) return;
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    if (date <= new Date()) {
      onDateSet(date);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="flex min-h-screen flex-col items-center justify-center px-6"
    >
      <div className="card-elevated p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          When was your last cigarette?
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Set the date and time to start tracking.
        </p>

        <div className="space-y-3 mb-8">
          <input
            type="date"
            value={dateStr}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-[16px] bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="w-full rounded-[16px] bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!dateStr}
          className="w-full rounded-[16px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Start Tracking
        </button>
      </div>
    </motion.div>
  );
};

export default QuitDatePicker;
