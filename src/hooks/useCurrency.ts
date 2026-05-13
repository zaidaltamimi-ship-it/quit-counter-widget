export type CurrencyCode = "EUR" | "GBP" | "USD" | "CZK";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
  CZK: "Kč",
};

// Currencies whose symbol is shown AFTER the amount (with a space)
const SUFFIX_CURRENCIES: CurrencyCode[] = ["CZK"];

const UK_COUNTRIES = ["GB", "IE", "GG", "IM", "JE"];
const CZ_COUNTRY = "CZ";
const EU_COUNTRIES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR",
  "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
];

const UK_TIMEZONES = [
  "Europe/London", "Europe/Dublin", "Europe/Guernsey",
  "Europe/Isle_of_Man", "Europe/Jersey",
];

const CZ_TIMEZONES = ["Europe/Prague"];

const EUROPEAN_TIMEZONES = [
  "Europe/", "Atlantic/Canary", "Atlantic/Azores",
  "Atlantic/Madeira", "Arctic/Longyearbyen",
];

function countryToCurrency(countryCode: string): CurrencyCode | null {
  const upper = countryCode.toUpperCase();
  if (upper === CZ_COUNTRY) return "CZK";
  if (UK_COUNTRIES.includes(upper)) return "GBP";
  if (upper === "US") return "USD";
  if (EU_COUNTRIES.includes(upper)) return "EUR";
  return null;
}

function detectFromTimezone(): CurrencyCode {
  if (typeof Intl === "undefined" || typeof window === "undefined") return "USD";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (CZ_TIMEZONES.includes(tz)) return "CZK";
  if (UK_TIMEZONES.includes(tz)) return "GBP";
  if (EUROPEAN_TIMEZONES.some((p) => tz.startsWith(p))) return "EUR";
  return "USD";
}

const STORAGE_KEY = "myaddiction-currency";

export function getCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && ["EUR", "GBP", "USD", "CZK"].includes(stored)) return stored;
  } catch { /* ignore */ }
  return detectFromTimezone();
}

export async function initCurrencyFromLocation(): Promise<CurrencyCode> {
  // If user already manually set a currency, respect it
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && ["EUR", "GBP", "USD", "CZK"].includes(stored)) return stored;
  } catch { /* ignore */ }

  let detected: CurrencyCode | null = null;

  try {
    const res = await fetch("https://ipwho.is/", { method: "GET" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.country_code) {
        detected = countryToCurrency(data.country_code);
      }
    }
  } catch {
    // network / CORS fallback
  }

  if (!detected) {
    detected = detectFromTimezone();
  }

  try {
    localStorage.setItem(STORAGE_KEY, detected);
  } catch { /* ignore */ }

  return detected;
}

export function setCurrency(code: CurrencyCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch { /* ignore */ }
}

export function getCurrencySymbol(code?: CurrencyCode): string {
  return CURRENCY_SYMBOLS[code || getCurrency()];
}

export function formatMoney(amount: number, code?: CurrencyCode): string {
  const currency = code || getCurrency();
  const symbol = CURRENCY_SYMBOLS[currency];
  // CZK typically uses whole numbers (no decimals) and symbol after the amount
  if (SUFFIX_CURRENCIES.includes(currency)) {
    return `${Math.round(amount).toLocaleString("cs-CZ")} ${symbol}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}
