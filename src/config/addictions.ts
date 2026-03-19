import type { AddictionTypeConfig } from "@/types/addiction";

export const TOBACCO_MILESTONES = [
  { time: 0.33, titleKey: "m_heartRateDrops", descKey: "m_heartRateDropsDesc" },
  { time: 8, titleKey: "m_oxygenNormalizes", descKey: "m_oxygenNormalizesDesc" },
  { time: 24, titleKey: "m_heartAttackRiskDrops", descKey: "m_heartAttackRiskDropsDesc" },
  { time: 48, titleKey: "m_nerveEndingsRegrow", descKey: "m_nerveEndingsRegrowDesc" },
  { time: 72, titleKey: "m_breathingImproves", descKey: "m_breathingImprovesDesc" },
  { time: 336, titleKey: "m_circulationRestored", descKey: "m_circulationRestoredDesc" },
  { time: 2160, titleKey: "m_coughingDecreases", descKey: "m_coughingDecreasesDesc" },
  { time: 8760, titleKey: "m_riskHalved", descKey: "m_riskHalvedDesc" },
  { time: 43800, titleKey: "m_lungCancerRiskHalved", descKey: "m_lungCancerRiskHalvedDesc" },
  { time: 87600, titleKey: "m_riskNormalized", descKey: "m_riskNormalizedDesc" },
];

export const ALCOHOL_MILESTONES = [
  { time: 6, titleKey: "m_alcoholSugarStabilizes", descKey: "m_alcoholSugarStabilizesDesc" },
  { time: 24, titleKey: "m_alcoholWithdrawalPeaks", descKey: "m_alcoholWithdrawalPeaksDesc" },
  { time: 72, titleKey: "m_alcoholDetoxComplete", descKey: "m_alcoholDetoxCompleteDesc" },
  { time: 168, titleKey: "m_alcoholSleepImproves", descKey: "m_alcoholSleepImprovesDesc" },
  { time: 336, titleKey: "m_alcoholSkinImproves", descKey: "m_alcoholSkinImprovesDesc" },
  { time: 720, titleKey: "m_alcoholBPNormalizes", descKey: "m_alcoholBPNormalizesDesc" },
  { time: 2160, titleKey: "m_alcoholLiverFat", descKey: "m_alcoholLiverFatDesc" },
  { time: 8760, titleKey: "m_alcoholLiverRecovery", descKey: "m_alcoholLiverRecoveryDesc" },
];

export const ADDICTION_TYPES: AddictionTypeConfig[] = [
  {
    id: "cigarette",
    category: "tobacco",
    emoji: "🚬",
    labelKey: "cigarette",
    counterLabelKey: "timeSinceLastCigarette",
    unitLabelKey: "cigarettesAvoided",
    defaultPerDay: 20,
    caloriesPerUnit: 0,
    showPerDay: true,
    showPatchTracker: true,
    showReductionMode: false,
    milestones: TOBACCO_MILESTONES,
    statKeys: ["unitsAvoided", "moneySaved"],
  },
  {
    id: "vape",
    category: "tobacco",
    emoji: "💨",
    labelKey: "vape",
    counterLabelKey: "timeSinceLastVape",
    unitLabelKey: "sessionsAvoided",
    defaultPerDay: 10,
    caloriesPerUnit: 0,
    showPerDay: false,
    showPatchTracker: false,
    showReductionMode: false,
    milestones: TOBACCO_MILESTONES,
    statKeys: ["unitsAvoided", "moneySaved"],
  },
  {
    id: "iqos",
    category: "tobacco",
    emoji: "🔥",
    labelKey: "iqos",
    counterLabelKey: "timeSinceLastIqos",
    unitLabelKey: "sticksAvoided",
    defaultPerDay: 20,
    caloriesPerUnit: 0,
    showPerDay: true,
    showPatchTracker: true,
    showReductionMode: false,
    milestones: TOBACCO_MILESTONES,
    statKeys: ["unitsAvoided", "moneySaved"],
  },
  {
    id: "alcohol",
    category: "alcohol",
    emoji: "🍺",
    labelKey: "alcohol",
    counterLabelKey: "timeSinceLastDrink",
    unitLabelKey: "drinksAvoided",
    defaultPerDay: 4,
    caloriesPerUnit: 150,
    showPerDay: true,
    showPatchTracker: false,
    showReductionMode: true,
    milestones: ALCOHOL_MILESTONES,
    statKeys: ["unitsAvoided", "moneySaved", "caloriesSaved"],
  },
];

export function getAddictionConfig(typeId: string): AddictionTypeConfig {
  return ADDICTION_TYPES.find(a => a.id === typeId) || ADDICTION_TYPES[0];
}
