export type Locale = "en" | "cs";

export const translations = {
  en: {
    // QuitDatePicker
    whenLastCigarette: "When was your last cigarette?",
    setDateToStart: "Set the date and time to start tracking.",
    cigarette: "Cigarette",
    vape: "Vape",
    iqos: "IQOS",
    perDay: "Per day",
    startTracking: "Start Tracking",

    // LiveCounter
    timeSinceLastCigarette: "Time since last cigarette",
    timeSinceLastVape: "Time since last vape",
    timeSinceLastIqos: "Time since last IQOS",
    days: "days",
    hrs: "hrs",
    min: "min",
    sec: "sec",

    // StatsBar
    cigarettesAvoided: "Cigarettes avoided",
    sessionsAvoided: "Sessions avoided",
    sticksAvoided: "Sticks avoided",
    moneySaved: "Money saved",

    // HealthMilestones
    healthMilestones: "Health milestones",
    heartRateDrops: "Heart rate drops",
    heartRateDropsDesc: "Your heart rate begins to return to normal.",
    oxygenNormalizes: "Oxygen normalizes",
    oxygenNormalizesDesc: "Carbon monoxide levels in your blood drop by half.",
    heartAttackRiskDrops: "Heart attack risk drops",
    heartAttackRiskDropsDesc: "Your risk of heart attack begins to decrease.",
    nerveEndingsRegrow: "Nerve endings regrow",
    nerveEndingsRegrowDesc: "Your sense of taste and smell start to improve.",
    breathingImproves: "Breathing improves",
    breathingImprovesDesc: "Your bronchial tubes begin to relax. Lung capacity increases.",
    circulationRestored: "Circulation restored",
    circulationRestoredDesc: "Blood circulation has significantly improved.",
    coughingDecreases: "Coughing decreases",
    coughingDecreasesDesc: "Lung function increases up to 30%.",
    riskHalved: "Risk halved",
    riskHalvedDesc: "Heart disease risk is now half that of a smoker.",
    lungCancerRiskHalved: "Lung cancer risk halved",
    lungCancerRiskHalvedDesc: "Risk of lung cancer drops to half that of a smoker.",
    riskNormalized: "Risk normalized",
    riskNormalizedDesc: "Heart disease risk is now the same as a non-smoker.",

    // HealthLogForm
    healthLog: "Health Log",
    logTodaysHealth: "Log today's health data",
    newEntry: "New entry",
    heartRate: "Heart rate",
    weight: "Weight",
    systolicBP: "Systolic BP",
    diastolicBP: "Diastolic BP",
    peakFlowLung: "Peak flow (lung capacity)",
    noteOptional: "Note (optional)",
    saveEntry: "Save Entry",
    recent: "Recent",

    // HealthCharts
    healthProgress: "Health Progress",
    heartRateLabel: "Heart Rate",
    bloodPressure: "Blood Pressure",
    weightLabel: "Weight",
    peakFlowLabel: "Peak Flow",
    logAtLeast2: "Log at least 2 entries to see trends.",
    latest: "latest",

    // PatchTracker
    nicotinePatches: "Nicotine Patches",
    notTracking: "Not tracking",
    trackPatchSchedule: "Track your Niquitin patch schedule and get reminded when to step down.",
    startPatchTracking: "Start Patch Tracking",
    fullStrength: "Full strength — strongest nicotine support.",
    reducedStrength: "Reduced strength — tapering down.",
    lowStrength: "Low strength — final phase before stopping.",
    step1: "Step 1",
    step2: "Step 2",
    step3: "Step 3",
    weeksTotal: "weeks total",
    daysLeft: "days left",
    readyToMove: (step: number, mg: number) => `Ready to move to Step ${step} (${mg}mg)`,
    programComplete: "Program complete. You can stop using patches.",
    stepDownReminders: "Step-down reminders",
    stopPatchTracking: "Stop patch tracking",

    // ResetConfirmation
    resetCounter: "Reset counter",
    areYouSure: "Are you sure?",
    cancel: "Cancel",
    yesReset: "Yes, reset",

    // Language
    language: "Language",
  },
  cs: {
    // QuitDatePicker
    whenLastCigarette: "Kdy byla vaše poslední cigareta?",
    setDateToStart: "Nastavte datum a čas pro začátek sledování.",
    cigarette: "Cigareta",
    vape: "Vape",
    iqos: "IQOS",
    startTracking: "Začít sledovat",

    // LiveCounter
    timeSinceLastCigarette: "Čas od poslední cigarety",
    timeSinceLastVape: "Čas od posledního vapování",
    timeSinceLastIqos: "Čas od posledního IQOS",
    days: "dny",
    hrs: "hod",
    min: "min",
    sec: "sek",

    // StatsBar
    cigarettesAvoided: "Vynechaných cigaret",
    sessionsAvoided: "Vynechaných sezení",
    sticksAvoided: "Vynechaných náplní",
    moneySaved: "Ušetřeno",

    // HealthMilestones
    healthMilestones: "Zdravotní milníky",
    heartRateDrops: "Tepová frekvence klesá",
    heartRateDropsDesc: "Vaše tepová frekvence se začíná vracet do normálu.",
    oxygenNormalizes: "Kyslík se normalizuje",
    oxygenNormalizesDesc: "Hladina oxidu uhelnatého v krvi klesne na polovinu.",
    heartAttackRiskDrops: "Riziko infarktu klesá",
    heartAttackRiskDropsDesc: "Vaše riziko infarktu se začíná snižovat.",
    nerveEndingsRegrow: "Nervová zakončení dorůstají",
    nerveEndingsRegrowDesc: "Váš smysl pro chuť a čich se začíná zlepšovat.",
    breathingImproves: "Dýchání se zlepšuje",
    breathingImprovesDesc: "Vaše průdušky se začínají uvolňovat. Kapacita plic se zvyšuje.",
    circulationRestored: "Krevní oběh obnoven",
    circulationRestoredDesc: "Krevní oběh se výrazně zlepšil.",
    coughingDecreases: "Kašel ustupuje",
    coughingDecreasesDesc: "Funkce plic se zvyšuje až o 30 %.",
    riskHalved: "Riziko sníženo na polovinu",
    riskHalvedDesc: "Riziko srdečního onemocnění je nyní poloviční oproti kuřákovi.",
    lungCancerRiskHalved: "Riziko rakoviny plic sníženo",
    lungCancerRiskHalvedDesc: "Riziko rakoviny plic klesá na polovinu oproti kuřákovi.",
    riskNormalized: "Riziko normalizováno",
    riskNormalizedDesc: "Riziko srdečního onemocnění je stejné jako u nekuřáka.",

    // HealthLogForm
    healthLog: "Zdravotní deník",
    logTodaysHealth: "Zaznamenat dnešní zdravotní data",
    newEntry: "Nový záznam",
    heartRate: "Tepová frekvence",
    weight: "Hmotnost",
    systolicBP: "Systolický TK",
    diastolicBP: "Diastolický TK",
    peakFlowLung: "Výdechový průtok (kapacita plic)",
    noteOptional: "Poznámka (volitelné)",
    saveEntry: "Uložit záznam",
    recent: "Nedávné",

    // HealthCharts
    healthProgress: "Zdravotní pokrok",
    heartRateLabel: "Tepová frekvence",
    bloodPressure: "Krevní tlak",
    weightLabel: "Hmotnost",
    peakFlowLabel: "Výdechový průtok",
    logAtLeast2: "Pro zobrazení trendů zaznamenejte alespoň 2 záznamy.",
    latest: "poslední",

    // PatchTracker
    nicotinePatches: "Nikotinové náplasti",
    notTracking: "Nesledováno",
    trackPatchSchedule: "Sledujte svůj rozvrh náplastí a nechte se upozornit, kdy snížit dávku.",
    startPatchTracking: "Začít sledovat náplasti",
    fullStrength: "Plná síla — nejsilnější nikotinová podpora.",
    reducedStrength: "Snížená síla — postupné snižování.",
    lowStrength: "Nízká síla — závěrečná fáze před ukončením.",
    step1: "Fáze 1",
    step2: "Fáze 2",
    step3: "Fáze 3",
    weeksTotal: "týdnů celkem",
    daysLeft: "dní zbývá",
    readyToMove: (step: number, mg: number) => `Připraveno na Fázi ${step} (${mg}mg)`,
    programComplete: "Program dokončen. Můžete přestat používat náplasti.",
    stepDownReminders: "Připomínky snížení dávky",
    stopPatchTracking: "Zastavit sledování náplastí",

    // ResetConfirmation
    resetCounter: "Resetovat počítadlo",
    areYouSure: "Jste si jisti?",
    cancel: "Zrušit",
    yesReset: "Ano, resetovat",

    // Language
    language: "Jazyk",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
