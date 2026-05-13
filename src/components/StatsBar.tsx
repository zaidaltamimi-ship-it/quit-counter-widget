import type { TobaccoType } from "@/components/QuitDatePicker";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatMoney } from "@/hooks/useCurrency";

interface StatsBarProps {
  hoursElapsed: number;
  cigarettesPerDay: number;
  pricePerPack: number;
  cigarettesPerPack: number;
  tobaccoType: TobaccoType;
}

const StatsBar = ({
  hoursElapsed,
  cigarettesPerDay = 20,
  pricePerPack = 10,
  cigarettesPerPack = 20,
  tobaccoType,
}: StatsBarProps) => {
  const { t } = useLanguage();

  const unitLabels: Record<TobaccoType, string> = {
    cigarette: t.cigarettesAvoided,
    vape: t.sessionsAvoided,
    iqos: t.sticksAvoided,
  };

  const daysElapsed = hoursElapsed / 24;
  const cigarettesAvoided = Math.floor(daysElapsed * cigarettesPerDay);
  const moneySaved = ((daysElapsed * cigarettesPerDay) / cigarettesPerPack) * pricePerPack;

  return (
    <div className="card-elevated p-5">
      <div className="grid grid-cols-2 gap-4">
        <StatItem label={unitLabels[tobaccoType]} value={cigarettesAvoided.toLocaleString()} />
        <StatItem label={t.moneySaved} value={formatMoney(moneySaved)} />
      </div>
    </div>
  );
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono-tabular text-xl font-semibold text-foreground">{value}</p>
      <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
        {label}
      </p>
    </div>
  );
}

export default StatsBar;
