/**
 * Some broker exports wrap every line in an outer pair of quotes and double
 * the inner quotes, e.g. `"Date,""Action"",""Symbol"""`. A standard CSV parser
 * reads each line as a single field, so no header matches and every row fails.
 * This restores the standard form when the header line uses that shape.
 * Any other input is returned unchanged.
 */
export function unwrapQuotedLines(text: string): string {
  const lines = text.split(/\r\n|\r|\n/);
  const header = lines.find((line) => line.trim() !== "");

  if (!header || !isWrappedLine(header)) return text;

  return lines
    .map((line) => (isWrappedLine(line) ? line.slice(1, -1).replaceAll('""', '"') : line))
    .join("\n");
}

function isWrappedLine(line: string): boolean {
  return line.length >= 2 && line.startsWith('"') && line.endsWith('"') && line.includes('""');
}
