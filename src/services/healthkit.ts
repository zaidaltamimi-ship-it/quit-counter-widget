/**
 * HealthKit integration service.
 * Uses @perfood/capacitor-healthkit when running natively on iOS.
 * Falls back gracefully on web — sync simply returns null.
 */

export interface HealthSample {
  date: string; // ISO string
  value: number;
}

export interface HealthData {
  heartRate: HealthSample[];
  bloodPressureSystolic: HealthSample[];
  bloodPressureDiastolic: HealthSample[];
  weight: HealthSample[];
  respiratoryRate: HealthSample[];
}

let healthKitAvailable = false;
let initAttempted = false;

const READ_PERMISSIONS = [
  "heartRate",
  "bloodPressureSystolic",
  "bloodPressureDiastolic",
  "weight",
  "respiratoryRate",
];

async function getNativePlatform() {
  try {
    const cap = await import("@capacitor/core").catch(() => null);
    if (!cap) return null;
    if (!cap.Capacitor.isNativePlatform()) return null;
    if (cap.Capacitor.getPlatform() !== "ios") return null;
    return cap.Capacitor;
  } catch {
    return null;
  }
}

async function getPlugin() {
  try {
    // Dynamic import so web builds don't fail when plugin isn't available
    const mod: any = await import(
      /* @vite-ignore */ "@perfood/capacitor-healthkit"
    ).catch(() => null);
    return mod?.CapacitorHealthkit ?? null;
  } catch {
    return null;
  }
}

export async function initHealthKit(): Promise<boolean> {
  initAttempted = true;
  const cap = await getNativePlatform();
  if (!cap) {
    console.log("HealthKit: not iOS native, skipping.");
    healthKitAvailable = false;
    return false;
  }

  const plugin = await getPlugin();
  if (!plugin) {
    console.warn("HealthKit: plugin not available.");
    return false;
  }

  try {
    const auth = await plugin.isAvailable();
    if (auth?.value === false) {
      console.warn("HealthKit: not available on device.");
      return false;
    }

    await plugin.requestAuthorization({
      all: [],
      read: READ_PERMISSIONS,
      write: [],
    });

    healthKitAvailable = true;
    console.log("HealthKit: authorized.");
    return true;
  } catch (err) {
    console.warn("HealthKit init failed:", err);
    healthKitAvailable = false;
    return false;
  }
}

export function isHealthKitAvailable(): boolean {
  return healthKitAvailable;
}

export function isHealthKitSupported(): Promise<boolean> {
  return getNativePlatform().then((p) => !!p);
}

async function querySample(
  plugin: any,
  sampleName: string,
  startDate: Date,
  endDate: Date
): Promise<HealthSample[]> {
  try {
    const result = await plugin.queryHKitSampleType({
      sampleName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    });
    const items = result?.resultData ?? [];
    return items
      .map((it: any) => ({
        date: it.startDate ?? it.endDate,
        value: typeof it.value === "number" ? it.value : Number(it.value),
      }))
      .filter((s: HealthSample) => !isNaN(s.value) && s.date);
  } catch (err) {
    console.warn(`HealthKit: query ${sampleName} failed`, err);
    return [];
  }
}

/**
 * Fetch health data from HealthKit for the given date range.
 */
export async function fetchHealthData(
  startDate: Date,
  endDate: Date = new Date()
): Promise<HealthData | null> {
  if (!initAttempted) await initHealthKit();
  if (!healthKitAvailable) return null;

  const plugin = await getPlugin();
  if (!plugin) return null;

  const [heartRate, sys, dia, weight, resp] = await Promise.all([
    querySample(plugin, "heartRate", startDate, endDate),
    querySample(plugin, "bloodPressureSystolic", startDate, endDate),
    querySample(plugin, "bloodPressureDiastolic", startDate, endDate),
    querySample(plugin, "weight", startDate, endDate),
    querySample(plugin, "respiratoryRate", startDate, endDate),
  ]);

  return {
    heartRate,
    bloodPressureSystolic: sys,
    bloodPressureDiastolic: dia,
    weight,
    respiratoryRate: resp,
  };
}

/**
 * Group health samples into one entry per day, taking the latest sample.
 */
export function aggregateDaily(data: HealthData) {
  const byDay = new Map<
    string,
    {
      date: string;
      heartRate?: number;
      systolic?: number;
      diastolic?: number;
      weight?: number;
      peakFlow?: number;
    }
  >();

  const upsert = (
    samples: HealthSample[],
    field: "heartRate" | "systolic" | "diastolic" | "weight" | "peakFlow"
  ) => {
    for (const s of samples) {
      const day = s.date.slice(0, 10);
      const cur = byDay.get(day) ?? { date: s.date };
      // keep latest sample of the day
      const prevDate = (cur as any)[`__${field}_date`] as string | undefined;
      if (!prevDate || s.date > prevDate) {
        (cur as any)[field] = Math.round(s.value * 100) / 100;
        (cur as any)[`__${field}_date`] = s.date;
      }
      byDay.set(day, cur);
    }
  };

  upsert(data.heartRate, "heartRate");
  upsert(data.bloodPressureSystolic, "systolic");
  upsert(data.bloodPressureDiastolic, "diastolic");
  upsert(data.weight, "weight");
  upsert(data.respiratoryRate, "peakFlow");

  return Array.from(byDay.values()).map((e) => {
    const clean: any = { ...e };
    Object.keys(clean).forEach((k) => k.startsWith("__") && delete clean[k]);
    return clean;
  });
}
