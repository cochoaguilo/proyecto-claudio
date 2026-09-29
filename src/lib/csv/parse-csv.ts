import Papa from "papaparse";

export interface ParseCsvResult {
  data: Record<string, string>[];
  errors: Papa.ParseError[];
}

/**
 * Parses a CSV File into an array of raw string-keyed rows.
 * Uses the first row as the header row and skips empty lines.
 * When `skipLines` is greater than 0, that many leading lines are dropped
 * before the next line is treated as the header row (e.g. exports with a
 * junk preamble before the real header). Defaults to 0, matching prior
 * behavior byte-for-byte for callers that don't pass it.
 * When `trimTrailingLines` is greater than 0, that many trailing lines are
 * also dropped (e.g. exports with a junk footer after the data). Papa's
 * streaming `beforeFirstChunk` hook can't see the end of the file, so this
 * path reads the whole file as text upfront instead of streaming it.
 * Defaults to 0, which keeps the streaming path and prior behavior
 * byte-for-byte for every existing caller.
 */
export function parseCsvFile(
  file: File,
  skipLines: number = 0,
  trimTrailingLines: number = 0
): Promise<ParseCsvResult> {
  if (trimTrailingLines > 0) {
    return parseCsvFileWithTrailingTrim(file, skipLines, trimTrailingLines);
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      ...(skipLines > 0
        ? {
            beforeFirstChunk: (chunk: string) =>
              chunk.split(/\r\n|\r|\n/).slice(skipLines).join("\n"),
          }
        : {}),
      complete: (results) => {
        resolve({ data: results.data, errors: results.errors });
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

async function parseCsvFileWithTrailingTrim(
  file: File,
  skipLines: number,
  trimTrailingLines: number
): Promise<ParseCsvResult> {
  const text = await file.text();
  const lines = text.split(/\r\n|\r|\n/);
  const trimmed = lines
    .slice(skipLines, lines.length - trimTrailingLines)
    .join("\n");

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(trimmed, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({ data: results.data, errors: results.errors });
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}
