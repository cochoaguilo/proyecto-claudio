import Papa from "papaparse";

const HEADER_PREFIX = "Instrument,";

/**
 * Extracts the positions table from a TOS Position Statement export.
 * The header row is located by its "Instrument," prefix instead of a fixed
 * line offset, and the table ends at the first blank line, so preambles and
 * footers of any length are ignored. Some exports (e.g. re-saved copies)
 * wrap an entire data row in quotes when it contains a quoted field, which
 * Papa reads as a single cell; such rows are unwrapped and re-parsed.
 */
export function parsePositionStatement(
  text: string
): Record<string, string>[] {
  const lines = text.replace(/^﻿/, "").split(/\r\n|\r|\n/);
  const headerIndex = lines.findIndex((line) =>
    line.startsWith(HEADER_PREFIX)
  );
  if (headerIndex === -1) return [];

  const headers = parseLine(lines[headerIndex]);
  const rows: Record<string, string>[] = [];

  for (const line of lines.slice(headerIndex + 1)) {
    if (!line.trim()) break;

    let cells = parseLine(line);
    if (cells.length === 1 && headers.length > 1) {
      cells = parseLine(cells[0]);
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function parseLine(line: string): string[] {
  return Papa.parse<string[]>(line).data[0] ?? [];
}
