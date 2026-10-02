# Feature: Remove Usuarios and Productos entities

## Objective
Remove the two original placeholder entities (`Usuarios`, `Productos`) now that three real entities (`Transactions`, `Quote`, `Positions`) exist, per user request.

## Why
User asked directly to delete the Usuarios and Productos tables — no longer needed now that the real entities are in place.

## Scope
- Delete `src/features/usuarios/`, `src/features/productos/`, `src/app/usuarios/`, `src/app/productos/`, and their sample CSVs.
- Remove the two corresponding links from the landing page (`src/app/page.tsx`).
- Shared infrastructure (`DataTable`, `lib/csv/*`, other entities) untouched — verified no leftover references.

## Constraints
- Same branch: `feat/tanstack-tables-csv-scaffold`.

## Tasks
- [x] T1. Delete `src/features/usuarios/`, `src/features/productos/`, `src/app/usuarios/`, `src/app/productos/`, `public/samples/usuarios-sample.csv`, `public/samples/productos-sample.csv`.
- [x] T2. Edit `src/app/page.tsx` — remove the Usuarios/Productos links, keep Transactions/Quote/Positions.
- [x] T3. Verify no residual references: `grep -ri "usuarios|productos"` over `src/` — zero matches.
- [x] T4. Verify: cleared stale `.next` cache, `npm run build` succeeded, route table shows only `/`, `/positions`, `/quote`, `/transactions`. Manual browser check: landing shows 3 links, `/usuarios` returns 404.

## Progress
All tasks complete. `git status --short` shows exactly the expected diff: 2 deletions of sample CSVs, 2 deletions of routes, 6 deletions of feature files, 1 edit to `src/app/page.tsx`. Committed as a single work unit (see commit hash in the parent scaffold history).

## Next step
None — removal complete and verified.
