# Quote CSV adapter

## Objective
Port `quote_sheet.txt` (Google Apps Script `MarketWatch_TOS`) into TypeScript via the `CsvAdapter<TRaw,TTarget>` pattern, mirroring `odd/tasks/transactions-csv-adapter.md`, so the Quote table's CSV upload consumes a raw TOS export instead of the old pre-processed sheet-shaped CSV.

## Problem / why
The Quote entity (`src/features/quote/`) currently assumes the uploaded CSV headers already match the Apps Script's *output* column names (`Symbol`, `52High`, `MAC_STOP`, ...). The real source is a raw ThinkOrSwim watchlist export, transformed by `MarketWatch_TOS` before it ever reached the Quote sheet. Same gap as Transactions before `7e22dfc`.

## Product decisions (confirmed via AskUserQuestion, 2026-09-29)
- **Fecha source**: the script derives it from the uploaded filename (`YYYY_MM_DD` prefix), because it aggregated a whole Drive folder. A single browser-uploaded file has no equivalent — user confirmed: **use today's date**, applied to every row of the upload (not filename, not a manual picker).
- **Raw CSV shape**: confirmed the file has the same 3-line junk preamble as the original TOS export — real header is line 4, data from line 5. `parseCsvFile` (shared, Papa.parse-based) currently assumes header on line 1; needs an opt-in `skipLines` to stay generic for other entities.
- **Single file per upload** (not the script's whole-Drive-folder aggregation) — same architectural gap/redesign already accepted for Transactions; the app's upload model is one file via `<input type=file>`.
- **Fixed 16 columns**, no dynamic extra-column support — matches the already-scaffolded `quoteSchema` (16 fields), consistent with how Transactions made `strategy` optional instead of inventing schema for data that isn't there.

## Scope
- `src/lib/csv/parse-csv.ts` — add optional `skipLines` param (Papa `beforeFirstChunk`), default 0, so other entities are unaffected.
- `src/features/quote/raw-quote.ts` (new) — `RawQuoteRow` (all-string fields) + `RAW_QUOTE_HEADER_MAP`, 15 raw headers (no `Fecha` — it's not a raw column).
- `src/features/quote/quote-parsing.ts` (new) — pure functions: numeric-field coercion (port of the script's `/^\d+(\.\d+)?$/` test, 0 on failure/empty — target schema fields are all `z.coerce.number()`), and `todayIsoDate()`.
- `src/features/quote/quote-csv.adapter.ts` (new) — `QuoteDraft` + `QuoteCsvAdapter implements CsvAdapter<RawQuoteRow, QuoteDraft>`. No stateful/cross-row logic (the script has none inside `MarketWatch_TOS` itself — unlike Transactions' lifecycle tracking).
- `src/features/quote/quote-container.tsx` — pipeline: `parseCsvFile(file, 3)` → `remapHeaders(RAW_QUOTE_HEADER_MAP)` → `new QuoteCsvAdapter().adapt(...)` → `validateRows(quoteSchema, draftRows as unknown as Record<string, unknown>[])`.
- `public/samples/quote-sample.csv` — replace with a genuinely raw-shaped sample: 3 junk lines + real header (no Fecha) + 5 data rows (3 valid, 2 invalid — same convention as transactions-sample.csv).
- Out of scope: `quoteSchema`/`quote.columns.tsx` (target shape unchanged), dynamic extra-column support, `Position_Statement_TOS`/weekend-trader-flag logic (Positions entity, separate task).

## Acceptance criteria
- Uploading a raw TOS-shaped CSV (3 junk lines, real headers on line 4) through `/quote` produces the same 16-field `Quote` rows the old pipeline expected, with `fecha` = today's date for every row.
- `npm run lint` and `npm run build` pass.
- Other entities' CSV upload (`parseCsvFile` callers) unaffected by the `skipLines` addition (default stays 0 = current behavior).

## Tasks
- [x] T1 — `parse-csv.ts`: add `skipLines` param
- [x] T2 — `raw-quote.ts`: `RawQuoteRow` + `RAW_QUOTE_HEADER_MAP`
- [x] T3 — `quote-parsing.ts`: numeric coercion + `todayIsoDate`
- [x] T4 — `quote-csv.adapter.ts`: `QuoteDraft` + `QuoteCsvAdapter`
- [x] T5 — wire into `quote-container.tsx`
- [x] T6 — replace `quote-sample.csv` with raw-shaped sample
- [x] T7 — verify: `npm run lint`, `npm run build`

## TDD mode
Off (no test runner configured in this project — same as transactions-csv-adapter). Verification is lint + build + manual trace against `quote_sheet.txt`.

## Deviation from spec (T6)
T6 asked for one invalid row with "empty Symbol" and one with "a non-numeric
value like `n/a` in a numeric column." Per T3's confirmed coercion rule
(every numeric target field is `z.coerce.number()`, so `parseQuoteNumericField`
must always return a number, 0 on unparseable/empty input — mirroring
`normalizeNumber`'s "0 on failure" convention already used by Transactions),
a non-numeric cell like `n/a` silently becomes `0` post-adapter and passes
zod validation; it does not produce an invalid row. So the sample's second
invalid row uses an empty `Description` (also `min(1)` in `quoteSchema`)
instead, while still including an `n/a` value in that same row's `Last`
column to demonstrate the coercion-to-0 behavior in practice.

## Verification
- `npm run lint`: **pass** — 0 errors, 1 pre-existing warning in
  `src/components/data-table/data-table.tsx` (React Compiler / TanStack Table
  incompatibility), unrelated to this change.
- `npm run build`: **pass** — `next build` compiled successfully, TypeScript
  checked clean, all routes (including `/quote`) generated as static content.

## Progress
Task doc created 2026-09-29. Implementation completed 2026-09-29: T1–T7 done,
lint and build both pass. No deviations besides the T6 sample-data adjustment
noted above.
