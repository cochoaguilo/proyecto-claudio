# Feature: TanStack Tables CSV Scaffold

## Objective
Greenfield Next.js scaffold: one generic `DataTable` (TanStack Table v8 + shadcn/ui) consumed by two example entities (Usuarios, Productos), each populated by uploading a CSV validated against a fixed, per-entity zod schema.

## Why
User request: "varias tablas que consumen la tabla de la libreria tanstack". Data source: CSV upload. Entities: distinct (Usuarios, Productos placeholders). Columns: fixed per entity, not inferred from CSV headers. Confirmed via AskUserQuestion in plan mode.

## Scope
- Next.js (App Router, TS, `src/`) + Tailwind + shadcn/ui
- `@tanstack/react-table` v8 (pinned `^8.21.3`), `papaparse`, `zod`
- Screaming architecture (`features/usuarios`, `features/productos`), container/presentational split, one generic `DataTable`
- Sample CSVs with deliberately invalid rows for manual testing

## Constraints
- Branch: `feat/tanstack-tables-csv-scaffold` (created off `main`)
- `.atl` folder must be moved aside before `create-next-app` and restored after (not on its allowlist)
- No auth, no real backend/DB, no automated tests in this scaffold
- TDD mode: off (no test runner configured yet in this empty repo) — verification via `npx tsc --noEmit` / `npm run build` + manual browser check

## Tasks

- [ ] T1. Scaffold Next.js app (`create-next-app`) with `.atl` moved aside/restored; verify `npm run dev` boots
- [ ] T2. `shadcn init` + add required components (button, table, input, checkbox, dropdown-menu, badge, separator, skeleton, alert, sonner, select, scroll-area, label)
- [ ] T3. Install `@tanstack/react-table@^8.21.3`, `papaparse`, `zod`, `@types/papaparse` (dev)
- [ ] T4. `lib/csv/parse-csv.ts` (papaparse wrapper) + `lib/csv/validate-rows.ts` (generic zod-based validator, never throws)
- [ ] T5. `features/usuarios/*` (schema, columns, container) and `features/productos/*` (schema, columns, container)
- [ ] T6. `components/data-table/*` (DataTable, toolbar, pagination, sortable column header) — single `useReactTable` call
- [ ] T7. `components/data-table/csv-uploader.tsx` (file input + invalid-rows summary alert)
- [ ] T8. Routes: `app/layout.tsx` (+ Toaster), `app/page.tsx` (landing), `app/usuarios/page.tsx`, `app/productos/page.tsx`
- [ ] T9. `public/samples/usuarios-sample.csv` and `productos-sample.csv` (3 valid + 3 invalid rows each)
- [ ] T10. Verify: `npx tsc --noEmit`, `npm run build`, manual browser pass (sorting, search, pagination, row selection, column visibility, CSV upload + invalid-row reporting) on both `/usuarios` and `/productos`

## Progress
(updated as tasks complete)

## Next step
Delegate T1–T9 to a writer agent per the approved plan; run T10 verification after.
