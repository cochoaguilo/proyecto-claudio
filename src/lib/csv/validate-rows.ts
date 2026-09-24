import type { ZodType } from "zod";

export interface InvalidRow {
  rowIndex: number;
  raw: Record<string, string>;
  issues: string[];
}

export interface ValidateRowsResult<T> {
  validRows: T[];
  invalidRows: InvalidRow[];
}

/**
 * Validates raw CSV rows against a zod schema.
 * Never throws: every row lands in either `validRows` or `invalidRows`,
 * so a malformed CSV degrades gracefully instead of crashing the caller.
 */
export function validateRows<T>(
  schema: ZodType<T>,
  rows: Record<string, string>[]
): ValidateRowsResult<T> {
  const validRows: T[] = [];
  const invalidRows: InvalidRow[] = [];

  rows.forEach((raw, rowIndex) => {
    const result = schema.safeParse(raw);
    if (result.success) {
      validRows.push(result.data);
    } else {
      invalidRows.push({
        rowIndex,
        raw,
        issues: result.error.issues.map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        }),
      });
    }
  });

  return { validRows, invalidRows };
}
