/** Strips "$" and "," then parses as a float. Returns 0 for empty/invalid input. */
export function normalizeNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const cleaned = value.toString().trim().replace("$", "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

export interface ParsedSymbol {
  uniqueKey: string;
  symbol: string;
  instrument: "Stock" | "Option";
}

/**
 * Parses a broker "Symbol" field. Option format: "TICKER MM/DD/YYYY STRIKE C|P"
 * (e.g. "AAPL 01/17/2026 150 C"). Anything else is treated as a stock symbol.
 */
export function parseTransactionSymbol(symbolOriginal: string): ParsedSymbol {
  const optionMatch = symbolOriginal.match(
    /^([A-Z]+)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+(\.\d+)?)\s+([CP])$/
  );

  if (!optionMatch) {
    return { uniqueKey: symbolOriginal, symbol: symbolOriginal, instrument: "Stock" };
  }

  const ticker = optionMatch[1];
  const [month, day, year] = optionMatch[2].split("/");
  const expiry = `${day}/${month}/${year}`;
  const strike = parseFloat(optionMatch[3]);
  const type = optionMatch[5];

  return {
    uniqueKey: `${ticker}-${expiry} ${strike} ${type}`,
    symbol: ticker,
    instrument: "Option",
  };
}

/**
 * Finds the last "MM/DD/YYYY" substring in the raw date field and returns it
 * as an ISO "YYYY-MM-DD" string, or null if none is found.
 */
export function parseTransactionDate(rawDate: string): string | null {
  const matches = rawDate.toString().match(/\d{2}\/\d{2}\/\d{4}/g);
  if (!matches) return null;

  const finalDate = matches[matches.length - 1];
  const [month, day, year] = finalDate.split("/");
  return `${year}-${month}-${day}`;
}

/** Case-insensitive: true for any action containing "buy" (matches esCompraApertura). */
export function isOpeningAction(action: string): boolean {
  if (!action) return false;
  return action.toString().toLowerCase().includes("buy");
}

export type NetActionDelta = 1 | -1 | 0;

/**
 * Exact-match classifier ported from normalizeAction/Transactions_Status.
 * Known gap, preserved as-is: "sell to open" and "buy to close" are NOT
 * recognized (return 0), only "buy to open"/"buy" (+1 = purchase) and
 * "sell to close"/"sell"/"expired" (-1 = sale).
 */
export function classifyNetAction(action: string): NetActionDelta {
  if (!action) return 0;
  const normalized = action.toString().toLowerCase().trim();
  if (["buy to open", "buy"].includes(normalized)) return 1;
  if (["sell to close", "sell", "expired"].includes(normalized)) return -1;
  return 0;
}
