# Positions CSV adapter

## Objective
Port `position_sheet.txt` (Google Apps Script `Position_Statement_TOS`) into TypeScript via the `CsvAdapter<TRaw,TTarget>` pattern, mirroring `odd/tasks/transactions-csv-adapter.md` and `odd/tasks/quote-csv-adapter.md`, so the Positions table's CSV upload consumes a raw TOS "Position Statement" export instead of the old pre-processed sheet-shaped CSV.

## Problem / why
The Positions entity (`src/features/positions/`) currently assumes the uploaded CSV headers already match the Apps Script's *output* column names (`Key`, `Stock Mark`, `Delta Position`, ...). The real source is a raw ThinkOrSwim Position Statement export, transformed by `Position_Statement_TOS` before it ever reached the Positions sheet. Same gap already closed for Transactions (`7e22dfc`) and Quote.

## Product decisions (confirmed via AskUserQuestion, 2026-09-29)
- **"Strategies Stops" / weekend-trader-flag snapshot-restore is OUT OF SCOPE.** `quote_sheet.txt`'s orchestrator (`MarketWatch_TOS`) brackets `Position_Statement_TOS()` with `snapshotWeekendTraderFlags_()`/`restoreWeekendTraderFlags_()`, which read/write a third sheet, `"Strategies Stops"` (column A codes + column U 0/1 flags) — pure Google-Sheets-formula-recalculation mitigation with zero data flow into Positions' row shape. User confirmed a `Strategies Stops` entity may exist *in the future*, but is not built now — do not port any trace of this logic. Note for a future task if/when that entity is proposed.
- **Stock-vs-option row-drop behavior is PRESERVED as-is.** When a ticker's block has any option rows, the script discards that block's own stock/underlying row entirely and emits only the option rows (a covered call's stock leg does not appear in the table once the call exists). User confirmed: keep this behavior unchanged, do not add the stock row back.
- **Raw CSV shape confirmed**: 6 leading junk/preamble lines, real header on line 7, 11 trailing footer lines (TOS Position Statement page-footer boilerplate) — matches the script's `datosCrudos.slice(6, datosCrudos.length - 11)` exactly. `parseCsvFile` needs a second opt-in param for trailing-line trimming (leading `skipLines` already exists from the Quote task).
- **No `Fecha`/date field needed.** The script parses a date out of `datosCrudos[0][0]` (`formatearFecha_`) only to prefix the *Google Sheet's* row 1 (`["Fecha", fechaArchivo, ...]`) above the real header/data — it is NOT one of the 15 fields in the already-scaffolded `positionSchema`/`POSITION_HEADER_MAP`. Do not port `formatearFecha_` or emit any date field; it has no target column to land in.
- **Numeric cleanup is uniform, not selective.** The script's `limpiarValorNumerico_` only runs on a specific column subset (`COLUMNAS_NUMERICAS`) and flips `.` → `,` (Spanish/Sheets-locale artifact for writing back into a Sheet — pure noise for a TS port, safely dropped, not a real design decision). Since every numeric field in `positionSchema` is `z.coerce.number()` anyway (same as Quote), apply ONE shared numeric-cleanup helper uniformly to every numeric target field (`quantity`, `days`, `tradePrice`, `mark`, `last`, `stockMark`, `stockLast`, `deltaPosition`, `theta`, `optionDelta`, `optionTheta`, `netLiq`), same "0 on empty/unparseable" convention as `parseQuoteNumericField`/`normalizeNumber`. Strip parens-as-negative (`(4.15)` → `-4.15`) and any non `[\d.-]` character before parsing; do NOT replicate the comma-decimal flip.

## Source algorithm (`Position_Statement_TOS`, port faithfully except as noted above)

Raw CSV columns after preamble/footer trim: `Instrument, Qty, Trade Price, Mark, Last, Days, Delta, Theta, OptionDelta, OptionTheta, Net Liq` (plus `Mrk Chng, P/L Open, P/L Day, BP Effect`, which are simply absent from the header map — `remapHeaders` already drops any raw column not present in the map, no explicit deletion step needed).

Row-by-row walk, **in original file order** (never sort — row sequence within a block is significant: ticker row → underlying/descriptive row → option rows):

For each row, `instrument = raw.instrument.trim()`. Classify (mirror the script's regexes):
- `isStockRow` = `/^[A-Z]{1,6}$/.test(instrument)` — a bare 1–6 letter ticker.
- `isOptionRow` = `/\b(CALL|PUT)\b/i.test(instrument)` OR `/^\d+\s+\d{2}\s+[A-Z]{3}\s+\d{2}\s+\d+(\.\d+)?\s+(CALL|PUT)\b/i.test(instrument)` (the TOS numeric option format, e.g. `100 17 JAN 25 220 CALL`).
- Otherwise, if a `currentSymbol` block is open: an **underlying/descriptive row** (e.g. `APPLE INC`) — captures this row's `mark`/`last` as the block's `stockMark`/`stockLast` (used by any option rows still to come in this block), and backfills them onto the block's `actionRow` if it hasn't been finalized/pushed yet.

State kept across the walk: `blocks: Map<symbol, { actionRow: Draft | null; options: Draft[] }>` (insertion-ordered), `currentSymbol`, `stockMark`, `stockLast` (reset to `""` every time a new stock row opens a block).

Branch behavior:
1. **Stock row** → `currentSymbol = instrument`; reset `stockMark = stockLast = ""`; get-or-create `blocks[currentSymbol]`; build and store its `actionRow`:
   `key = symbol = description = currentSymbol`, `quantity = parseNum(raw.qty)`, `days = 0` (no days field on a stock row), `tradePrice = parseNum(raw.tradePrice)`, `mark = parseNum(raw.mark)`, `last = parseNum(raw.last)`, `stockMark = 0`, `stockLast = 0` (these two fields describe the *underlying's* price from an option row's perspective; on the stock's own row they're unused/always 0, matching the original script), `deltaPosition = parseNum(raw.delta)`, `theta = parseNum(raw.theta)`, `optionDelta = 0`, `optionTheta = 0`, `netLiq = parseNum(raw.netLiq)`.
2. **Descriptive row** (only meaningful when `currentSymbol` is set) → update `stockMark`/`stockLast` block-locals from this row's `mark`/`last`; if the block's `actionRow` exists, backfill its `stockMark`/`stockLast` fields too (mirrors the script; harmless since the actionRow is discarded anyway whenever options exist — see step 4).
3. **Option row** (only meaningful when `currentSymbol` is set) → push a new draft into `blocks[currentSymbol].options`: `key = \`${currentSymbol}-${description}\`` where `description = parsePositionDescription(instrument)` (see below), `symbol = currentSymbol`, `quantity = parseNum(raw.qty)`, `days = parseNum(raw.days)`, `tradePrice = parseNum(raw.tradePrice)`, `mark = parseNum(raw.mark)`, `last = parseNum(raw.last)`, `stockMark = stockMark` (current block-local), `stockLast = stockLast` (current block-local), `deltaPosition = parseNum(raw.delta)`, `theta = parseNum(raw.theta)`, `optionDelta = parseNum(raw.optionDelta)`, `optionTheta = parseNum(raw.optionTheta)`, `netLiq = parseNum(raw.netLiq)`.

**`parsePositionDescription(instrument)`** (port of `procesarDescripcion_`, pure function): strip the leading literal prefix `"0,001/(US$ 1145)"` if present; remove the substring `"100 "`; convert a `"DD MON YY"` date token (JAN–DEC) to `"DD/MM/YYYY"` (year → `20YY`); replace `CALL`/`CAL` → `C`, `PUT` → `P`.

**Final assembly** (after the whole file has been walked): for each block in insertion order — if `block.options.length > 0`, emit all of `block.options`; else emit `block.actionRow` (if present). Then **filter out every emitted row where `quantity === 0`** (closed positions — a business rule from the original script, not an error/invalid-row condition; these rows never reach `validateRows` at all, valid or invalid).

## Scope
- `src/lib/csv/parse-csv.ts` — add a second optional param (e.g. `trimTrailingLines: number = 0`) alongside the existing `skipLines`. Papa's `beforeFirstChunk` can't see the end of the file, so when `trimTrailingLines > 0`, read the whole `File` as text (`file.text()`), split into lines, drop the first `skipLines` and last `trimTrailingLines`, rejoin, and run `Papa.parse` on that string (not the streaming `File` path) instead. When `trimTrailingLines === 0`, keep the exact current behavior byte-identical (existing streaming `Papa.parse(file, ...)` path, `skipLines` handled via `beforeFirstChunk` as already implemented for Quote) — no other caller (`transactions-container.tsx`, `quote-container.tsx`) passes this new param, so they must be completely unaffected.
- `src/features/positions/raw-position.ts` (new) — `RawPositionRow` (all-string fields: `instrument, qty, tradePrice, mark, last, days, delta, theta, optionDelta, optionTheta, netLiq`) + `RAW_POSITION_HEADER_MAP` mapping the raw headers `Instrument, Qty, "Trade Price", Mark, Last, Days, Delta, Theta, OptionDelta, OptionTheta, "Net Liq"` to those fields. (`Mrk Chng`, `P/L Open`, `P/L Day`, `BP Effect` are simply not in the map, same drop-by-omission convention `remapHeaders` already provides.)
- `src/features/positions/position-parsing.ts` (new) — pure functions: numeric cleanup (`parsePositionNumericField` — trim, parens-as-negative, strip non `[\d.-]` chars, `parseFloat`, `0` on empty/`NaN`, no comma-flip), row classification (`isStockRow`, `isOptionRow`), and `parsePositionDescription`, each with a doc comment naming the `position_sheet.txt` function it ports.
- `src/features/positions/position-csv.adapter.ts` (new) — `PositionDraft` (same 15 fields as `Position`/`positionSchema`, numeric fields as real `number`) + `PositionCsvAdapter implements CsvAdapter<RawPositionRow, PositionDraft>`, implementing the stateful sequential block-walk described above, ending with the `quantity === 0` filter.
- `src/features/positions/positions-container.tsx` — pipeline: `parseCsvFile(file, 6, 11)` → `remapHeaders(rawRows, RAW_POSITION_HEADER_MAP)` → `new PositionCsvAdapter().adapt(...)` → `validateRows(positionSchema, draftRows as unknown as Record<string, unknown>[])`.
- `public/samples/positions-sample.csv` — replace with a raw TOS-Position-Statement-shaped sample: 6 junk preamble lines + real header (no Fecha column) + rows across at least 2 symbol blocks demonstrating BOTH kept branches — one block with options (stock row present in the raw data but must NOT appear in the final imported table) and one pure-stock block with no options (its stock row DOES appear) — + 11 trailing junk/footer lines. See note below on "invalid" rows for this entity.
- Out of scope: `positions.schema.ts` / `positions.columns.tsx` (target shape unchanged), `Strategies Stops` entity/logic (deferred per decision above), `crearYGuardarCSVSymbols_desdeSheet_` and any other Drive/Sheet-write side effects (no equivalent needed in a stateless browser upload).

## Note on the "N valid + M invalid" sample convention
Unlike Transactions/Quote, `key`/`symbol`/`description` here are **adapter-derived** from a successfully classified `instrument`, not a raw pass-through CSV cell — so a naturally-occurring blank/invalid row is unlikely to arise from realistic TOS data. Prefer accuracy over forcing artificial invalid rows into the sample; if a plausible invalid case doesn't fit the domain, a sample demonstrating the classification/drop behavior correctly (documented in the task doc) is an acceptable substitute for the usual 2-invalid-rows convention. Do include at least one row whose `quantity` is `0` in the raw data, to demonstrate the (distinct, non-error) closed-position filter actually removes it from the output.

## Acceptance criteria
- Uploading a raw TOS Position Statement CSV (6 leading + 11 trailing junk lines) through `/positions` produces the same 15-field `Position` rows the old pipeline expected.
- Stock rows are dropped whenever the same ticker has option rows; kept when it doesn't.
- Rows with `quantity === 0` never appear in the imported table (filtered before `validateRows`, not surfaced as invalid).
- `npm run lint` and `npm run build` pass.
- Other entities' CSV upload (`transaction-csv.adapter`, `quote-csv.adapter`, and any other `parseCsvFile` caller) are completely unaffected by the new `trimTrailingLines` param.

## Tasks
- [x] T1 — `parse-csv.ts`: add `trimTrailingLines` param (whole-text path only when > 0)
- [x] T2 — `raw-position.ts`: `RawPositionRow` + `RAW_POSITION_HEADER_MAP`
- [x] T3 — `position-parsing.ts`: numeric cleanup, row classification, description parsing
- [x] T4 — `position-csv.adapter.ts`: `PositionDraft` + `PositionCsvAdapter` (stateful block walk)
- [x] T5 — wire into `positions-container.tsx`
- [x] T6 — replace `positions-sample.csv` with raw-shaped sample
- [x] T7 — verify: `npm run lint`, `npm run build`

## Verification

Cross-checked the "Source algorithm" section against `position_sheet.txt`
(`Position_Statement_TOS`, `limpiarValorNumerico_`, `procesarDescripcion_`)
line by line before implementing: the row-classification regexes and
`procesarDescripcion_`'s prefix-strip / "100 " removal / date-token
conversion / CALL·CAL→C / PUT→P transforms all matched the task doc's
description exactly. No transcription error found.

`npm run lint`:
```
> proyecto-claudio@0.1.0 lint
> eslint

C:\Users\marco\Proyecto Claudio\src\components\data-table\data-table.tsx
  51:17  warning  Compilation Skipped: Use of incompatible library
  ...react-hooks/incompatible-library

✖ 1 problem (0 errors, 1 warning)
```
The one warning is pre-existing, in an untouched file (`data-table.tsx`,
React Compiler + TanStack Table interop), unrelated to this change.

`npm run build`:
```
> proyecto-claudio@0.1.0 build
> next build

▲ Next.js 16.3.6 (Turbopack)
✓ Compiled successfully in 3.0s
  Running TypeScript ...
  Finished TypeScript in 3.8s ...
✓ Generating static pages using 8 workers (7/7) in 1274ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /positions
├ ○ /quote
└ ○ /transactions

○  (Static)  prerendered as static content
```
Both clean.

Additionally ran the real pipeline (`parseCsvFile(file, 6, 11)` →
`remapHeaders` → `PositionCsvAdapter().adapt(...)` → `validateRows`)
against the new `public/samples/positions-sample.csv` via a throwaway
`tsx` script (deleted after use, not part of the diff) to independently
confirm the hand-trace:
- AAPL block (stock row + "APPLE INC" descriptive row + one TOS-numeric-format
  CALL row): stock row dropped, option row emitted as
  `{ key: "AAPL-17/01/2025 220 C", stockMark: 215.3, stockLast: 215.32,
  theta: -3.2, optionTheta: -0.04, ... }` — confirms date-token conversion,
  CALL→C, parens-as-negative, and descriptive-row stockMark/stockLast
  backfill all work together.
- MSFT block (stock row only, no options): kept as its own row.
- TSLA block (stock row, `Qty=0`, no options): built then filtered out by
  the final `quantity !== 0` step — distinct from the AAPL stock-drop case.
- Result: 2 valid rows, 0 invalid rows.

## TDD mode
Off (no test runner configured — same as transactions-csv-adapter and quote-csv-adapter). Verification is lint + build + manual trace against `position_sheet.txt`.

## Deferred / related (not this task)
- `Strategies Stops` entity + weekend-trader-flag snapshot/restore — user confirmed may exist in the future; not built now.

## Progress
Task doc created 2026-09-29. Implementation complete 2026-09-29: T1-T7 all
done, lint and build both clean, adapter logic independently verified
against the sample CSV. No deviations from spec; no transcription errors
found in the task doc's port of `position_sheet.txt`.
