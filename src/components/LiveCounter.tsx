import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { AddictionTypeId } from "@/types/addiction";
import { getAddictionConfig } from "@/config/addictions";
import { useLanguage } from "@/i18n/LanguageContext";

interface LiveCounterProps {
  quitDate: Date;
  typeId: AddictionTypeId;
}

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcElapsed(quitDate: Date): TimeElapsed {
  const diff = Math.max(0, Date.now() - quitDate.getTime());
  return {
    seconds: Math.floor(diff / 1000) % 60,
    minutes: Math.floor(diff / 60000) % 60,
    hours: Math.floor(diff / 3600000) % 24,
    days: Math.floor(diff / 86400000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

const LiveCounter = ({ quitDate, typeId }: LiveCounterProps) => {
  const { t } = useLanguage();
  const [elapsed, setElapsed] = useState<TimeElapsed>(calcElapsed(quitDate));
  const [pulse, setPulse] = useState(false);
  const config = getAddictionConfig(typeId);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = calcElapsed(quitDate);
      setElapsed(next);
      if (next.seconds === 0) {
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [quitDate]);

  const label = (t as any)[config.counterLabelKey] || config.counterLabelKey;

  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
        {label}
      </p>
      <div className="flex items-baseline justify-center gap-1">
        <CounterUnit value={elapsed.days} label={t.days} />
        <Separator />
        <CounterUnit value={pad(elapsed.hours)} label={t.hrs} />
        <Separator />
        <CounterUnit value={pad(elapsed.minutes)} label={t.min} />
        <Separator />
        <CounterUnit value={pad(elapsed.seconds)} label={t.sec} />
      </div>
      <motion.div
        className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-primary"
        animate={{ opacity: pulse ? 1 : 0.3 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      />
    </div>
  );
};

function CounterUnit({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono-tabular text-4xl font-semibold text-foreground leading-none">
        {value}
      </span>
      <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="font-mono-tabular text-2xl font-light text-muted-foreground/40 mx-1 mb-3">
      :
    </span>
  );
}

export default LiveCounter;
