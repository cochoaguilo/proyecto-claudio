/**
 * Renames raw CSV header keys to schema field keys before validation.
 * Generic and reusable by any entity whose CSV headers don't match its
 * schema field names (e.g. headers with spaces or symbols).
 */
export function remapHeaders<T extends string>(
  rows: Record<string, string>[],
  headerMap: Record<string, T>
): Record<T, string>[] {
  return rows.map((row) => {
    const mapped = {} as Record<T, string>;
    for (const [rawHeader, field] of Object.entries(headerMap)) {
      mapped[field as T] = row[rawHeader] ?? "";
    }
    return mapped;
  });
}
