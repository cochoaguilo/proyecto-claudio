# Transactions: append CSV uploads and delete rows

## Objective
Each CSV upload adds rows instead of replacing the table, and the user can delete selected rows after a confirmation dialog.

## Problem / Why
- `handleFile` replaces `data` on every upload, so a second file erases the first.
- Appending raw batches independently would reuse `codigo` (TX001...) across batches and break position status. Codigo/status are computed per batch by `TransactionCsvAdapter`.

## Scope
- Persist raw CSV rows (`transactions:raw-rows`) instead of derived transactions. Derive the table as `adapt(rawRows)` + manual edits.
- Dedupe on upload by raw-row content with occurrence counts: re-uploading the same file adds nothing; a file with legitimately repeated identical rows keeps them.
- Give each raw row a `sourceId` (random UUID) that flows to `Transaction.sourceId`, used to delete rows.
- Row selection → "Eliminar seleccionadas" button → shadcn AlertDialog confirmation → remove raw rows.
- Out of scope: "last upload" deletion, cross-tab conflict handling beyond the existing storage sync, server persistence.

## Constraints / Decisions
- Deleting a row and re-uploading its file brings it back (dedupe is content-based, not identity-based). Disclosed to user.
- Old `transactions:rows` localStorage key is no longer read.
- Table `getRowId` uses `sourceId` so selection survives deletes/re-derivation.

## Checklist
- [x] T1 Add `sourceId` to raw row and transaction schema; adapter propagates it.
- [x] T2 Raw-rows persistence + append/dedupe merge in container; derive data via useMemo.
- [x] T3 DataTable: `getRowId` prop, selection-delete action with AlertDialog confirmation.
- [x] T4 Wire delete in container.

## Acceptance
- Two different CSVs appear together; codigo/status computed across the union.
- Re-uploading the same CSV does not duplicate rows.
- Selecting rows and confirming removes exactly those rows; cancel removes nothing.

## Checks
- No test runner exists in package.json, so no RED/GREEN cycle was possible.
- Passed: `npx tsc --noEmit`, `npx eslint` on changed dirs (only the pre-existing React Compiler warning on `useReactTable`), `npx next build`.
- Not done: browser check of append/dedupe/delete with the sample CSV.

## Progress / Next step
- All tasks implemented in one work unit (includes earlier `aux` removal, since those files overlap). Next: browser verification with a sample CSV.
