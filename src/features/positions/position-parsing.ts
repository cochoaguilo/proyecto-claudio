/**
 * Ports Position_Statement_TOS's numeric cleanup pipeline
 * (limpiarValorNumerico_ + parseNumber_): trims, converts a
 * parenthesized value to negative ("(4.15)" -> "-4.15"), strips any
 * character outside [\d.-], then parses as a float. Unlike the original
 * script (whose comma-decimal flip only served writing back into a
 * Spanish-locale Sheet cell), every numeric field in positionSchema is
 * z.coerce.number(), so this always returns a number: 0 on empty or
 * unparseable input (same "0 on failure" convention as
 * parseQuoteNumericField/normalizeNumber), applied uniformly to every
 * numeric field instead of the original's COLUMNAS_NUMERICAS subset.
 */
export function parsePositionNumericField(
  value: string | undefined | null
): number {
  if (!value) return 0;

  let cleaned = value.toString().trim();
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    cleaned = `-${cleaned.slice(1, -1)}`;
  }
  cleaned = cleaned.replace(/[^\d.-]/g, "");
  if (!cleaned) return 0;

  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Ports Position_Statement_TOS's `esAccion` test: a bare 1-6 letter ticker
 * with no strike/expiry/type suffix marks the start of a new symbol block.
 */
export function isStockRow(instrument: string): boolean {
  return /^[A-Z]{1,6}$/.test(instrument);
}

/**
 * Ports Position_Statement_TOS's `esOpcion` test: either a bare "CALL"/"PUT"
 * word anywhere in the instrument, or the full TOS numeric option format
 * (e.g. "100 17 JAN 25 220 CALL").
 */
export function isOptionRow(instrument: string): boolean {
  return (
    /\b(CALL|PUT)\b/i.test(instrument) ||
    /^\d+\s+\d{2}\s+[A-Z]{3}\s+\d{2}\s+\d+(\.\d+)?\s+(CALL|PUT)\b/i.test(
      instrument
    )
  );
}

const DESCRIPTION_PREFIX_TO_STRIP = "0,001/(US$ 1145)";

const MONTH_ABBREVIATION_TO_NUMBER: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
};

/**
 * Ports Position_Statement_TOS's procesarDescripcion_: strips the leading
 * "0,001/(US$ 1145)" TOS boilerplate prefix if present, removes the first
 * "100 " substring, converts a "DD MON YY" date token to "DD/MM/20YY", and
 * abbreviates CALL/CAL -> C and PUT -> P.
 */
export function parsePositionDescription(instrument: string): string {
  if (!instrument) return "";

  let description = instrument.trim();

  if (description.startsWith(DESCRIPTION_PREFIX_TO_STRIP)) {
    description = description
      .substring(DESCRIPTION_PREFIX_TO_STRIP.length)
      .trim();
  }

  description = description.replace("100 ", "");

  const dateMatch = description.match(/(\d{1,2}) ([A-Z]{3}) (\d{2})/);
  if (dateMatch) {
    description = description.replace(
      dateMatch[0],
      `${dateMatch[1].padStart(2, "0")}/${
        MONTH_ABBREVIATION_TO_NUMBER[dateMatch[2]]
      }/20${dateMatch[3]}`
    );
  }

  return description.replace(/CALL|CAL/g, "C").replace(/PUT/g, "P").trim();
}
