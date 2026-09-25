# Feature: Quote entity table

## Objective
Add a fourth entity — `Quote` — consuming the existing generic `DataTable`, following the exact pattern established by `Usuarios`/`Productos`/`Transactions`: fixed zod schema, CSV upload with per-row validation, container/presentational split, header remap for non-camelCase CSV headers.

## Why
User request: a table with columns `Symbol, Description, Fecha, Last, 52High, 52Low, MovAvgExponential, 100-day-Low, High, Low, BollingerBands, SMA 10W, MAC_STOP, TrendPilot_STOP, SMA 10d, SMA 100d` — a stock-screener / technical-indicators watchlist. Entity name confirmed by user: `Quote`, route `/quote`.

## Scope
- New feature folder `src/features/quote/` (schema, columns, container) mirroring `src/features/transactions/`.
- New route `src/app/quote/page.tsx`.
- Landing page (`src/app/page.tsx`) gets a fourth link.
- Reuses the existing generic `src/lib/csv/remap-headers.ts` (already exists from the Transactions feature — do not recreate it).
- Sample CSV `public/samples/quote-sample.csv` with the exact requested headers, a few valid rows + a couple deliberately invalid.

## Constraints
- Same branch: `feat/tanstack-tables-csv-scaffold`.
- Reuse the existing generic `DataTable` and `remap-headers.ts` as-is — zero changes to `src/components/data-table/*` or `src/lib/csv/*`.
- No auth, no backend/DB, no automated tests.

## Field mapping / types (CSV header -> schema field -> zod type)
| CSV header | field | type |
|---|---|---|
| Symbol | symbol | string, required |
| Description | description | string, required |
| Fecha | fecha | string, required (kept as plain string, not strict date-parsed) |
| Last | last | number (coerce) |
| 52High | week52High | number (coerce) — renamed, a CSV header can't start with a digit as a JS identifier |
| 52Low | week52Low | number (coerce) — renamed for the same reason |
| MovAvgExponential | movAvgExponential | number (coerce) |
| 100-day-Low | low100Day | number (coerce) — renamed, same reason |
| High | high | number (coerce) |
| Low | low | number (coerce) |
| BollingerBands | bollingerBands | string, optional — format/units unclear from the column name alone, kept as a loose optional string rather than over-constraining |
| SMA 10W | sma10w | number (coerce) |
| MAC_STOP | macStop | number (coerce) |
| TrendPilot_STOP | trendPilotStop | number (coerce) |
| SMA 10d | sma10d | number (coerce) |
| SMA 100d | sma100d | number (coerce) |

## Tasks
- [x] T1. `src/features/quote/quote.schema.ts` — zod schema (table above) + header map + inferred TS type. Evidence: file created with `quoteSchema`, `QUOTE_HEADER_MAP`, `Quote` type, matches field table exactly.
- [x] T2. `src/features/quote/quote.columns.tsx` — fixed `ColumnDef<Quote>[]`, selection checkbox column, sortable headers, numeric columns right-aligned. Evidence: mirrors `transactions.columns.tsx` structure; original CSV header text used as displayed labels ("52High", "MAC_STOP", "SMA 10W", etc.).
- [x] T3. `src/features/quote/quote-container.tsx` — upload/parse/remap/validate state, mirrors `transactions-container.tsx`. Evidence: calls `remapHeaders(rawRows, QUOTE_HEADER_MAP)` before `validateRows`, same Spanish toast message format.
- [x] T4. `src/app/quote/page.tsx` (thin route) + add link on `src/app/page.tsx`. Evidence: thin Server Component rendering `<QuoteContainer />`; fourth `Button asChild`/`Link` to `/quote` added to landing page.
- [x] T5. `public/samples/quote-sample.csv` — valid + deliberately invalid rows. Evidence: 3 valid rows (AAPL, MSFT, TSLA) + 2 invalid rows (empty Symbol, `Last` = "n/a").
- [x] T6. Verify: `npx tsc --noEmit`, `npm run build`. Evidence: `npx tsc --noEmit` — zero output, zero errors. `npm run build` — compiled successfully, `/quote` route listed as static (○) alongside `/`, `/productos`, `/transactions`, `/usuarios`. Manual browser pass left for the user (no browser access in this session).

## Progress
All tasks T1–T6 complete. Files created: `src/features/quote/quote.schema.ts`, `src/features/quote/quote.columns.tsx`, `src/features/quote/quote-container.tsx`, `src/app/quote/page.tsx`, `public/samples/quote-sample.csv`. File edited: `src/app/page.tsx` (added Quote link).
Commits:
- `7a4b93a` — feat: add quote entity with csv upload (T1–T4)
- `6bdfdbe` — chore: add sample quote csv for manual testing (T5)

## Next step
Manual browser verification by the user: upload `public/samples/quote-sample.csv` on `/quote`, confirm 3 valid / 2 invalid split, and sorting/search/pagination/selection/column-visibility all work.
