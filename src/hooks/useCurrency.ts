export type CurrencyCode = "EUR" | "GBP" | "USD";

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
};

const UK_TIMEZONES = [
  "Europe/London",
  "Europe/Dublin",
  "Europe/Guernsey",
  "Europe/Isle_of_Man",
  "Europe/Jersey",
];

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

  // UK first (subset of Europe/)
  if (UK_TIMEZONES.includes(tz)) return "GBP";

  // Rest of Europe
  if (EUROPEAN_TIMEZONES.some((prefix) => tz.startsWith(prefix))) return "EUR";

  return "USD";
}

const STORAGE_KEY = "myaddiction-currency";

export function getCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    if (stored && ["EUR", "GBP", "USD"].includes(stored)) return stored;
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
  return `${symbol}${amount.toFixed(2)}`;
}
