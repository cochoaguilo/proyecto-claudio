# transactions-csv-adapter

## Objective
Port the CSV-transformation logic in `transaction_sheet.txt` (a Google Apps Script that turned a raw broker transaction-history export into rows of the "Transactions" Google Sheet) into TypeScript, using the Adapter design pattern, wired into the existing `TransactionsContainer` CSV pipeline.

## Problem / why
`transaction_sheet.txt` (untracked file at repo root) contains three Apps Script functions:
- `Transactions_CSV` — per-row transform: parses the broker's `Symbol` field into `{uniqueKey, symbol, instrument}` (option vs stock via regex), extracts/normalizes the trade date, normalizes numeric fields (strips `$`/`,`), abs's quantity.
- `AutoAssignCodigo` — assigns a grouping `Codigo` per position, propagating `Strategy`/`Entry Price` from the group's opening trade.
- `Transactions_Status` — nets `Quantity` per `Codigo` to mark each group `Open`/`Closed`.

Today, `TransactionsContainer` (`src/features/transactions/transactions-container.tsx`) assumes the uploaded CSV is ALREADY in the fully-processed Sheet format (`public/samples/transactions-sample.csv` headers: Codigo, Strategy, Entry Price, ..., Position Status) and only runs `parseCsvFile -> remapHeaders -> validateRows` (zod coercion is the only transform). There is no code performing the Apps-Script-side business logic anywhere in the TS app.

## User decisions (confirmed via AskUserQuestion, 2026-09-26)
1. The CSV uploaded to the Transactions table from now on is the **raw broker export**, not the pre-processed one. The adapter replaces what Google Apps Script used to do, client-side.
2. Raw CSV column order (no real sample available): **Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount** — i.e. exactly `row[0]..row[7]` as indexed in `transaction_sheet.txt`.

## Known architecture gap (disclosed, not asked — forced by the stateless browser model)
`AutoAssignCodigo`/`Transactions_Status` in Apps Script are **stateful across runs**: they read `Codigo`/`Position Status` already persisted in the Sheet from previous imports to decide new rows. A single browser CSV upload has no such persisted history — every upload is a fresh, complete batch. Adaptation: treat the WHOLE uploaded batch as the full history and reconstruct position lifecycles by symbol in chronological order (a new `Codigo` starts when net quantity for a symbol returns to 0 and a new trade appears; it's reused while net stays non-zero). This is a corrected generalization of the original per-run bug (which would otherwise glue unrelated future trades on the same symbol into one stale `Codigo`), not a new business feature. `Strategy` has no source data at all on first import (it's manually curated in the original sheet) — the schema's `strategy` field must become optional (like `aux`), left empty for the adapter to fill in later by hand, exactly mirroring what the script itself does (propagate, never invent).

`normalizeAction`'s exact-match net-quantity classifier (`"sell to close"/"sell"/"expired"` → sale, `"buy to open"/"buy"` → purchase, everything else → 0 delta) is ported **as-is**, including its known gap that `"sell to open"` / `"buy to close"` contribute no delta. This is a pre-existing limitation of the original script, not something to silently fix.

## Scope (this task)
Transactions entity only. Positions/Quote entities are NOT touched.

## Design — Adapter pattern
- `src/lib/csv/csv-adapter.ts` — generic `CsvAdapter<TRaw, TTarget>` interface: `adapt(rawRows: TRaw[]): TTarget[]`.
- `src/features/transactions/raw-transaction.ts` — `RawTransactionRow` type (8 string fields) + `RAW_TRANSACTION_HEADER_MAP` (raw CSV headers → `RawTransactionRow` keys), reusing the existing generic `remapHeaders`.
- `src/features/transactions/transaction-parsing.ts` — pure functions ported 1:1 from the script: `normalizeNumber`, `parseTransactionSymbol` (option/stock regex + uniqueKey), `parseTransactionDate` (last `\d{2}/\d{2}/\d{4}` match → ISO `YYYY-MM-DD`), `isOpeningAction` (`esCompraApertura`), `classifyNetAction` (`normalizeAction`).
- `src/features/transactions/transaction-csv.adapter.ts` — `TransactionCsvAdapter implements CsvAdapter<RawTransactionRow, TransactionDraft>`:
  1. Row-level parse of every raw row into a draft (uniqueKey, symbol, instrument, date, action, description, quantity, price, feesComm, amount).
  2. Sort by symbol then date.
  3. Walk each symbol's drafts in order, tracking running net quantity to assign `codigo` (format `TX###`, incrementing) per lifecycle, and mark `positionStatus` Open/Closed on net-zero crossing.
  4. Within each `codigo` group, seed `entryPrice`/`strategy` from the earliest `isOpeningAction` trade's own `price` (`strategy` stays `""` — no source data), then propagate to the rest of the group.
- Wire into `transactions-container.tsx`: `parseCsvFile -> remapHeaders(RAW_TRANSACTION_HEADER_MAP) -> new TransactionCsvAdapter().adapt(...) -> validateRows(transactionSchema, drafts)`.
- `transactions.schema.ts`: make `strategy` `.optional()` (mirrors `aux`); everything else unchanged.
- `validate-rows.ts`: widen row parameter type from `Record<string, string>[]` to `Record<string, unknown>[]` (adapter output includes numbers) — backward compatible, mechanical.
- Replace `public/samples/transactions-sample.csv` with a raw-broker-format sample (covers a stock buy/sell pair and one option row) so the new pipeline has something to manually test against.

## Tasks
- [x] T1 — `csv-adapter.ts` generic interface + `raw-transaction.ts` (type + header map)
- [x] T2 — `transaction-parsing.ts` pure functions (normalizeNumber, parseTransactionSymbol, parseTransactionDate, isOpeningAction, classifyNetAction)
- [x] T3 — `transaction-csv.adapter.ts` (`TransactionCsvAdapter`: row parse + lifecycle/codigo/status/entryPrice/strategy assignment)
- [x] T4 — Wire adapter into `transactions-container.tsx`; relax `strategy` in `transactions.schema.ts`; widen `validate-rows.ts` row type
- [x] T5 — Replace `public/samples/transactions-sample.csv` with a raw-format sample
- [x] T6 — Verify: `npm run lint`, `npm run build`; manual smoke check of the new sample against `/transactions`

## TDD mode
No test runner in `package.json` (no vitest/jest) → TDD is **off**. Functional checks are `npm run lint` and `npm run build` (Next 16 build type-checks by default).

## Verification evidence
- `npm run lint`: pass (0 errors, 1 pre-existing unrelated warning in `data-table.tsx`)
- `npm run build`: pass (compiles, type-checks, generates all 5 routes)
- Manual smoke check of `public/samples/transactions-sample.csv` against `/transactions`: not run in-session (no browser available); recommended before merge.

## Gentle AI review (RDD, lineage `review-902df86e044595ac`)
Risk: medium (343 changed lines, 9 files). Lens `review-reliability` ran, result: **approved**, acknowledged (authority burned). 9 advisory findings, all non-blocking/informational:
- **Fixed in this task** (broke the codebase's existing "never throws, always report via invalidRows" contract): `TransactionCsvAdapter.parseRow` no longer silently drops rows with an empty symbol or unparseable date — it now emits `""` for the offending field, which the existing zod schema (`.min(1)`) already surfaces as an `invalidRow`, consistent with how `validateRows` was designed to degrade gracefully.
- **Verified as a false positive**: reviewer flagged that a missing CSV column could leave `row.date` `undefined` and crash `parseTransactionDate`. Checked `remapHeaders` — it defaults every mapped field to `""` (`row[rawHeader] ?? ""`), so this can't actually happen through the real pipeline. No fix needed.
- **Deferred, disclosed as known/accepted** (informational, not re-opened):
  - `R3-group-by-ticker` — lifecycle net-quantity tracking groups by bare ticker (`symbol`), so a stock and its options on the same underlying share one running quantity and can cross-contaminate `codigo`/status. This matches the original Apps Script's own `codigoPorSymbol[symbol]` grouping (also by bare ticker), so it's not a new regression, but combined with the new lifecycle-reopening logic it's a real product question: should grouping instead be per `uniqueKey` (separates stock from each individual option contract)? **Open question for the user**, not decided unilaterally.
  - `R3-quantity-parse` — quantity uses `Math.abs(parseFloat(...))` (no `$`/`,` stripping), exactly matching the original script's `row[4]` handling. Intentional fidelity, not a bug.
  - `R3-date-single-digit` — date regex requires zero-padded `MM/DD/YYYY`, ported as-is from the original; now at least surfaces as an invalid row instead of disappearing.
  - `R3-float-net-zero` — exact float equality for net-zero detection; edge case for fractional-share quantities, low priority.
  - `R3-row-index-mismatch` — `invalidRows[].rowIndex` no longer matches the original CSV line number after the adapter sorts; cosmetic.
  - `R3-no-tests` — no automated tests (no test runner configured in this project); would be cheap to add if a runner is introduced later.

## Delivery strategy
Single PR / single commit at task close (small-to-medium change, well under the ~400 line heuristic). Feature branch already active: `feat/tanstack-tables-csv-scaffold`.

## Commit evidence
`7e22dfc` — `feat(transactions): add CSV adapter to replace Apps Script transform` on `feat/tanstack-tables-csv-scaffold`.
