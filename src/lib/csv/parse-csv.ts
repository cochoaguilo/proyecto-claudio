import Papa from "papaparse";

export interface ParseCsvResult {
  data: Record<string, string>[];
  errors: Papa.ParseError[];
}

/**
 * Parses a CSV File into an array of raw string-keyed rows.
 * Uses the first row as the header row and skips empty lines.
 */
export function parseCsvFile(file: File): Promise<ParseCsvResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
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
