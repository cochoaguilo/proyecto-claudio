# Feature: Transactions entity table

## Objective
Add a third entity — `Transactions` — consuming the existing generic `DataTable`, following the exact pattern already established by `Usuarios`/`Productos`: fixed zod schema, CSV upload with per-row validation, container/presentational split.

## Why
User request: a table with columns `Codigo, Strategy, Entry Price, Aux, UniqueKey, Symbol, Instrument, Date, Action, Description, Quantity, Price, Fees & Comm, Amount, Position Status` — matches a broker trade/transaction export. Route name confirmed by user: `Transactions` (English, matches the column language).

## Scope
- New feature folder `src/features/transactions/` (schema, columns, container) mirroring `src/features/usuarios/` and `src/features/productos/`.
- New route `src/app/transactions/page.tsx`.
- Landing page (`src/app/page.tsx`) gets a third link.
- CSV headers use the user's exact human-readable labels ("Entry Price", "Fees & Comm", "Position Status", etc.), which don't match camelCase schema field names — needs a small generic header-remap utility (`src/lib/csv/remap-headers.ts`) added to the existing `lib/csv` layer, reusable by any future entity with non-matching CSV headers.
- Sample CSV `public/samples/transactions-sample.csv` with the exact requested headers, a few valid rows + a couple deliberately invalid (same convention as the other two samples).

## Constraints
- Same branch: `feat/tanstack-tables-csv-scaffold` (not merged yet, this is additive to the same initial buildout — no new branch).
- Reuse the existing generic `DataTable` as-is — zero changes to `src/components/data-table/*`.
- No auth, no backend/DB, no automated tests (same as the rest of the scaffold).

## Field mapping / types (CSV header -> schema field -> zod type)
| CSV header | field | type |
|---|---|---|
| Codigo | codigo | string, required |
| Strategy | strategy | string, required |
| Entry Price | entryPrice | number (coerce) |
| Aux | aux | string, optional |
| UniqueKey | uniqueKey | string, required |
| Symbol | symbol | string, required |
| Instrument | instrument | string, required |
| Date | date | string, required (kept as string, not strict date-parsed — broker date formats vary) |
| Action | action | string, required |
| Description | description | string, required |
| Quantity | quantity | number (coerce) |
| Price | price | number (coerce) |
| Fees & Comm | feesComm | number (coerce) |
| Amount | amount | number (coerce) |
| Position Status | positionStatus | string, required |

## Tasks
- [x] T1. `src/lib/csv/remap-headers.ts` — generic `remapHeaders(rows, map)` utility, renames raw CSV header keys to schema field keys before validation
- [x] T2. `src/features/transactions/transactions.schema.ts` — zod schema (table above) + the header map + inferred TS type
- [x] T3. `src/features/transactions/transactions.columns.tsx` — fixed `ColumnDef<Transaction>[]`, selection checkbox column, sortable headers, numeric columns right-aligned/formatted
- [x] T4. `src/features/transactions/transactions-container.tsx` — upload/parse/remap/validate state, mirrors `usuarios-container.tsx`
- [x] T5. `src/app/transactions/page.tsx` (thin route) + add link on `src/app/page.tsx`
- [x] T6. `public/samples/transactions-sample.csv` — valid + deliberately invalid rows
- [x] T7. Verify: `npx tsc --noEmit`, `npm run build` (both zero errors). Manual browser pass NOT performed — no browser access in this session; left for the user.

## Progress
- T1 done — `442c2aa feat: add generic csv header remap utility`
- T2–T5 done — `b5fe49d feat: add transactions entity with csv upload` (schema, columns, container, route, landing page link)
- T6 done — `fd423e5 chore: add sample transactions csv for manual testing`
- T7 done — `npx tsc --noEmit` clean, `npm run build` succeeded (`/transactions` listed as a static route). Manual browser verification (upload sample CSV, sorting/search/pagination/selection/column-visibility) still needs to be done by the user — no browser access available here.

## Next step
User to manually verify `/transactions` in the browser with `public/samples/transactions-sample.csv` (3 valid rows, 2 deliberately invalid: empty Codigo, non-numeric Quantity).
