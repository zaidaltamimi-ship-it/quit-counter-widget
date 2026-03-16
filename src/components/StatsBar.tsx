import type { TobaccoType } from "@/components/QuitDatePicker";

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
}: StatsBarProps) => {
  const daysElapsed = hoursElapsed / 24;
  const cigarettesAvoided = Math.floor(daysElapsed * cigarettesPerDay);
  const moneySaved = ((daysElapsed * cigarettesPerDay) / cigarettesPerPack) * pricePerPack;

  return (
    <div className="card-elevated p-5">
      <div className="grid grid-cols-2 gap-4">
        <StatItem label="Cigarettes avoided" value={cigarettesAvoided.toLocaleString()} />
        <StatItem label="Money saved" value={`$${moneySaved.toFixed(2)}`} />
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
