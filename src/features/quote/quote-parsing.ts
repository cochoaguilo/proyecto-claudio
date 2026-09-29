/**
 * Ports MarketWatch_TOS's per-cell numeric coercion (trim + the
 * `/^\d+(\.\d+)?$/` numeric test, parseFloat on a match). Every numeric
 * target field in quoteSchema is `z.coerce.number()`, so unlike the original
 * script (which leaves non-numeric text as a string), this always returns a
 * number: 0 on empty or unparseable input (mirrors normalizeNumber's
 * "0 on failure" convention).
 */
export function parseQuoteNumericField(value: string | undefined | null): number {
  if (!value) return 0;
  const trimmed = value.toString().trim();
  if (!trimmed) return 0;
  const num = parseFloat(trimmed);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Returns the current local date as an ISO "YYYY-MM-DD" string. Substitutes
 * for MarketWatch_TOS's per-file filename-derived date: a single browser
 * upload has no filename to parse, so every row in the batch shares today's
 * date instead (confirmed product decision).
 */
export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
