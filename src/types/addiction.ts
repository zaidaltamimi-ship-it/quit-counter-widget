export type AddictionCategory = "tobacco" | "alcohol" | "substance" | "behavioral";

export type AddictionTypeId =
  | "cigarette" | "vape" | "iqos" | "snus" | "nicotine_gum" | "nicotine_spray"
  | "alcohol" | "beer" | "wine" | "spirits" | "cocktails"
  | "cannabis" | "caffeine"
  | "gambling" | "social_media" | "gaming" | "pornography" | "shopping" | "self_harm";

export interface MilestoneConfig {
  time: number; // hours
  titleKey: string;
  descKey: string;
}

export type StatKey = "unitsAvoided" | "moneySaved" | "caloriesSaved" | "hoursReclaimed" | "moneyEstimate";

export interface AddictionTypeConfig {
  id: AddictionTypeId;
  category: AddictionCategory;
  icon: string;
  labelKey: string;
  counterLabelKey: string;
  unitLabelKey: string;
  defaultPerDay: number;
  caloriesPerUnit: number;
  showPerDay: boolean;
  showPatchTracker: boolean;
  showReductionMode: boolean;
  /** When true, this addiction is tracked as a pure streak — no quantification, no money, no calories. Use for sensitive topics like self-harm. */
  streakOnly?: boolean;
  /** Whether the price input represents a per-unit cost or a monthly average spend. Defaults to "perUnit". */
  pricePeriod?: "perUnit" | "perMonth";
  milestones: MilestoneConfig[];
  statKeys: StatKey[];
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  craving: number; // 1-5
  note?: string;
}

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

export interface AddictionRecord {
  id: string;
  type: AddictionTypeId;
  quitDate: string;
  perDay: number;
  pricePerUnit: number;
  unitsPerPack: number;
  createdAt: string;
  healthEntries: HealthEntry[];
  moodEntries: MoodEntry[];
  // Reduction mode
  reductionMode?: boolean;
  weeklyTarget?: number;
  weeklyLog?: { week: string; actual: number }[];
  // Pause support
  pausedAt?: string | null;
  totalPausedMs?: number;
  // Slip log
  slips?: SlipEntry[];
}

export interface SlipEntry {
  id: string;
  occurredAt: string;
  kind: "continue" | "reset";
  note?: string;
}
