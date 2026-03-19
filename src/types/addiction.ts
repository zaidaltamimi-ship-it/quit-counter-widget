export type AddictionCategory = "tobacco" | "alcohol" | "other";

export type AddictionTypeId = "cigarette" | "vape" | "iqos" | "alcohol";

export interface MilestoneConfig {
  time: number; // hours
  titleKey: string;
  descKey: string;
}

export interface AddictionTypeConfig {
  id: AddictionTypeId;
  category: AddictionCategory;
  emoji: string;
  labelKey: string;
  counterLabelKey: string;
  unitLabelKey: string;
  defaultPerDay: number;
  caloriesPerUnit: number;
  showPerDay: boolean;
  showPatchTracker: boolean;
  showReductionMode: boolean;
  milestones: MilestoneConfig[];
  statKeys: string[];
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
  // Alcohol reduction mode
  reductionMode?: boolean;
  weeklyTarget?: number;
  weeklyLog?: { week: string; actual: number }[];
}
