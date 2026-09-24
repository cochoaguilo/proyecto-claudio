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

- [x] T1. Scaffold Next.js app (`create-next-app`) with `.atl` moved aside/restored; verify `npm run dev` boots — commit `d3e1e90`. Deviation: `create-next-app .` rejects the directory name "Proyecto Claudio" (npm naming rules forbid spaces/capitals), so scaffolded into a validly-named temp subfolder (`tmp-scaffold`) with the exact same flags, then moved all generated files (including dotfiles) up into the project root and removed the temp folder; fixed `package.json` `name` from `tmp-scaffold` to `proyecto-claudio`. `npm run dev` verified booting (HTTP 200 on `/`, then stopped).
- [x] T2. `shadcn init` + add required components — commit `d3e1e90`. Deviation: current shadcn CLI (v4.21.0) added a new interactive "component library" prompt (Base UI / React Aria / Radix UI) and a "preset" prompt not anticipated by the plan; ran non-interactively with `-b radix -p nova -y` to match the traditional Radix-based shadcn/ui architecture the task's component patterns assume. All 13 components added successfully (button, table, input, checkbox, dropdown-menu, badge, separator, skeleton, alert, sonner, select, scroll-area, label).
- [x] T3. Install `@tanstack/react-table@^8.21.3`, `papaparse`, `zod`, `@types/papaparse` (dev) — commit `d3e1e90`. Confirmed in `package.json`: `@tanstack/react-table: ^8.21.3` (not v9), `zod: ^4.6.5`.
- [x] T4. `lib/csv/parse-csv.ts` + `lib/csv/validate-rows.ts` — commit `107747d`. Generic, never throws (uses `safeParse` per row).
- [x] T5. `features/usuarios/*` and `features/productos/*` (schema, columns, container) — commit `3ccf6bb`. Schemas use zod v4 APIs (`z.email()`, `z.coerce.number()`, `z.preprocess()`) exactly as specced.
- [x] T6. `components/data-table/*` (DataTable, toolbar, pagination, sortable column header) — commit `107747d`. `useReactTable` called only in `data-table.tsx`; zero CSV/zod/entity imports in that file.
- [x] T7. `components/data-table/csv-uploader.tsx` — commit `107747d`. File input + destructive Alert with scrollable invalid-row list + Skeleton while loading.
- [x] T8. Routes: `app/layout.tsx` (+ Toaster), `app/page.tsx` (landing), `app/usuarios/page.tsx`, `app/productos/page.tsx` — commit `3ccf6bb`.
- [x] T9. Sample CSVs (3 valid + 3 invalid rows each) — commit `e3cd348`.
- [x] T10. Verify: `npx tsc --noEmit` → clean, no output/errors. `npm run build` → succeeded, all 4 routes (`/`, `/productos`, `/usuarios`, `/_not-found`) prerendered as static content. `npm run lint` → 0 errors, 1 benign warning (React Compiler flagging `useReactTable`'s non-memoizable return, expected/known with TanStack Table v8). Manual browser pass NOT performed (no browser access available to this agent) — left for the user.

## Progress
All tasks T1–T10 complete on branch `feat/tanstack-tables-csv-scaffold`. Four commits:
1. `d3e1e90` — chore: scaffold next.js app with tailwind and shadcn/ui
2. `107747d` — feat: add generic data-table with csv parsing and validation
3. `3ccf6bb` — feat: add usuarios and productos entities
4. `e3cd348` — chore: add sample csv files for manual testing

`npx tsc --noEmit` and `npm run build` both pass cleanly. Two deviations from the spec were forced by tooling, documented above (T1 directory-naming workaround, T2 shadcn CLI's new interactive prompts) — no deviation from the requested file/architecture layout, entity schemas, or component wiring.

## Next step
User to do the manual browser pass (sorting, search, pagination, row selection, column visibility, CSV upload + invalid-row reporting) on both `/usuarios` and `/productos`, using the sample CSVs in `public/samples/`. This document's own progress update is not yet committed — do that as a follow-up `docs:` commit if desired.
