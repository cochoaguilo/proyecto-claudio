# Feature: Positions entity table

## Objective
Add a fifth entity — `Positions` — consuming the existing generic `DataTable`, following the exact pattern established by `Usuarios`/`Productos`/`Transactions`/`Quote`: fixed zod schema, CSV upload with per-row validation, container/presentational split, header remap for non-camelCase CSV headers.

## Why
User request: a table with columns `Key, Symbol, Description, Quantity, Days, Trade Price, Mark, Last, Stock Mark, Stock Last, Delta Position, Theta, OptionDelta, OptionTheta, Net Liq` — an options-position table (Greeks: Delta, Theta; Net Liq; days to expiration). Entity name proposed by the orchestrator (not asked via question, per standing user preference): `Positions`, route `/positions` — flagged to the user for correction if wrong.

## Scope
- New feature folder `src/features/positions/` (schema, columns, container) mirroring `src/features/quote/`.
- New route `src/app/positions/page.tsx`.
- Landing page (`src/app/page.tsx`) gets a fifth link.
- Reuses the existing generic `src/lib/csv/remap-headers.ts` (do not recreate it).
- Sample CSV `public/samples/positions-sample.csv` with the exact requested headers, a few valid rows + a couple deliberately invalid.

## Constraints
- Same branch: `feat/tanstack-tables-csv-scaffold`.
- Reuse the existing generic `DataTable` and `remap-headers.ts` as-is — zero changes to `src/components/data-table/*` or `src/lib/csv/*`.
- No auth, no backend/DB, no automated tests.

## Field mapping / types (CSV header -> schema field -> zod type)
| CSV header | field | type |
|---|---|---|
| Key | key | string, required |
| Symbol | symbol | string, required |
| Description | description | string, required |
| Quantity | quantity | number (coerce) |
| Days | days | number (coerce) |
| Trade Price | tradePrice | number (coerce) |
| Mark | mark | number (coerce) |
| Last | last | number (coerce) |
| Stock Mark | stockMark | number (coerce) |
| Stock Last | stockLast | number (coerce) |
| Delta Position | deltaPosition | number (coerce) |
| Theta | theta | number (coerce) |
| OptionDelta | optionDelta | number (coerce) |
| OptionTheta | optionTheta | number (coerce) |
| Net Liq | netLiq | number (coerce) |

## Tasks
- [x] T1. `src/features/positions/positions.schema.ts` — zod schema (table above) + header map + inferred TS type
- [x] T2. `src/features/positions/positions.columns.tsx` — fixed `ColumnDef<Position>[]`, selection checkbox column, sortable headers, numeric columns right-aligned
- [x] T3. `src/features/positions/positions-container.tsx` — upload/parse/remap/validate state, mirrors `quote-container.tsx`
- [x] T4. `src/app/positions/page.tsx` (thin route) + add link on `src/app/page.tsx`
- [x] T5. `public/samples/positions-sample.csv` — valid + deliberately invalid rows
- [x] T6. Verify: `npx tsc --noEmit`, `npm run build`, manual browser pass (upload sample CSV, confirm valid/invalid split, sorting/search/pagination/selection/column-visibility all work on `/positions`)

## Progress
- T1: `positions.schema.ts` created — `positionSchema`, `Position` type, `POSITION_HEADER_MAP` exactly per field table.
- T2: `positions.columns.tsx` created — 15 data columns + select column, mirrors `quote.columns.tsx`; string columns (key/symbol/description) left-aligned, all numeric columns right-aligned with `.toFixed(2)`; headers use original CSV text (e.g. "Trade Price", "Stock Mark", "Delta Position", "Net Liq").
- T3: `positions-container.tsx` created — same state shape/toast copy as `quote-container.tsx`, calls `remapHeaders(rawRows, POSITION_HEADER_MAP)` before `validateRows`.
- T4: `src/app/positions/page.tsx` added (thin server component rendering `PositionsContainer`); `src/app/page.tsx` updated with a fifth `Button asChild`/`Link` to `/positions` labeled "Positions".
- T5: `public/samples/positions-sample.csv` added — header row + 3 valid rows (AAPL/SPY/TSLA option positions with plausible Greeks) + 2 invalid rows (empty `Key`, non-numeric `Quantity` "n/a").
- T6: `npx tsc --noEmit` — zero errors. `npm run build` — compiled successfully, `/positions` listed as a static route alongside the other four entities. Manual browser verification left to the user (no browser access in this environment).
- Commits: `cdb2b5e` feat: add positions entity with csv upload (T1–T4); `f293d8c` chore: add sample positions csv for manual testing (T5).

## Next step
None — all tasks (T1–T6) complete. User should do a manual browser pass on `/positions` to confirm upload/sort/search/pagination/selection behavior.
