export type CurrencyCode = "EUR" | "GBP" | "USD" | "CZK";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
  CZK: "Kč",
};

// Currencies whose symbol is shown AFTER the amount (with a space)
const SUFFIX_CURRENCIES: CurrencyCode[] = ["CZK"];

const UK_TIMEZONES = [
  "Europe/London",
  "Europe/Dublin",
  "Europe/Guernsey",
  "Europe/Isle_of_Man",
  "Europe/Jersey",
];

const CZ_TIMEZONES = ["Europe/Prague"];

const EUROPEAN_TIMEZONES = [
  "Europe/",
  "Atlantic/Canary",
  "Atlantic/Azores",
  "Atlantic/Madeira",
  "Arctic/Longyearbyen",
];

function detectFromTimezone(): CurrencyCode {
  if (typeof Intl === "undefined" || typeof window === "undefined") return "USD";

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (CZ_TIMEZONES.includes(tz)) return "CZK";
  if (UK_TIMEZONES.includes(tz)) return "GBP";
  if (EUROPEAN_TIMEZONES.some((prefix) => tz.startsWith(prefix))) return "EUR";

  return "USD";
}

const STORAGE_KEY = "myaddiction-currency";

export function getCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && ["EUR", "GBP", "USD", "CZK"].includes(stored)) return stored;
  } catch {
    // ignore
  }
  return detectFromTimezone();
}

export function setCurrency(code: CurrencyCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore
  }
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
