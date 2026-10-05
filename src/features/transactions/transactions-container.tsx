"use client";

import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDeleteButton } from "@/components/data-table/confirm-delete-button";
import { CsvUploader } from "@/components/data-table/csv-uploader";
import { parseCsvText } from "@/lib/csv/parse-csv";
import { remapHeaders } from "@/lib/csv/remap-headers";
import { unwrapQuotedLines } from "@/lib/csv/unwrap-quoted-lines";
import { validateRows } from "@/lib/csv/validate-rows";
import { usePersistedState } from "@/lib/storage/use-persisted-state";
import {
  transactionSchema,
  type Transaction,
} from "@/features/transactions/transactions.schema";
import {
  RAW_TRANSACTION_HEADER_MAP,
  type RawTransactionRow,
  type StoredRawTransactionRow,
} from "@/features/transactions/raw-transaction";
import { TransactionCsvAdapter } from "@/features/transactions/transaction-csv.adapter";
import { transactionsColumns } from "@/features/transactions/transactions.columns";

const ROWS_STORAGE_KEY = "transactions:raw-rows";
const EDITS_STORAGE_KEY = "transactions:manual-edits";

/** Columns that identify a raw CSV row's content (used for duplicate detection). */
const CONTENT_FIELDS = [
  "date",
  "action",
  "symbol",
  "description",
  "quantity",
  "price",
  "feesComm",
  "amount",
] as const satisfies readonly (keyof RawTransactionRow)[];

/** Columns filled in by hand; they survive CSV re-imports, keyed by uniqueKey. */
const manualEditSchema = transactionSchema
  .pick({ strategy: true, entryPrice: true })
  .partial();
const manualEditsSchema = z.record(z.string(), manualEditSchema);

type ManualEdits = z.infer<typeof manualEditsSchema>;
type ManualEditColumn = keyof z.infer<typeof manualEditSchema>;

const MANUAL_EDIT_COLUMNS = new Set<string>(
  Object.keys(manualEditSchema.shape)
);

const storedRawRowSchema = z.object({
  sourceId: z.string().min(1),
  date: z.string(),
  action: z.string(),
  symbol: z.string(),
  description: z.string(),
  quantity: z.string(),
  price: z.string(),
  feesComm: z.string(),
  amount: z.string(),
  batch: z.number().int().optional(),
});

const parseStoredRawRows = (value: unknown) =>
  z.array(storedRawRowSchema).parse(value);
const parseStoredEdits = (value: unknown) => manualEditsSchema.parse(value);

function contentKey(row: RawTransactionRow): string {
  return JSON.stringify(CONTENT_FIELDS.map((field) => row[field]));
}

function countByContent(rows: RawTransactionRow[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = contentKey(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Appends rows from a new upload. A row is skipped when the stored rows
 * already hold as many identical rows, so re-uploading the same file adds
 * nothing while a file with repeated identical rows keeps all of them.
 */
function latestBatch(rows: StoredRawTransactionRow[]): number {
  return Math.max(0, ...rows.map((row) => row.batch ?? 0));
}

function mergeRawRows(
  stored: StoredRawTransactionRow[],
  incoming: RawTransactionRow[]
): StoredRawTransactionRow[] {
  const storedCounts = countByContent(stored);
  const batch = latestBatch(stored) + 1;
  const seenInUpload = new Map<string, number>();
  const additions: StoredRawTransactionRow[] = [];

  for (const row of incoming) {
    const key = contentKey(row);
    const occurrence = (seenInUpload.get(key) ?? 0) + 1;
    seenInUpload.set(key, occurrence);

    if (occurrence > (storedCounts.get(key) ?? 0)) {
      additions.push({ ...row, sourceId: crypto.randomUUID(), batch });
    }
  }

  return [...stored, ...additions];
}

function applyManualEdits(rows: Transaction[], edits: ManualEdits) {
  return rows.map((row) => ({ ...row, ...edits[row.uniqueKey] }));
}

export function TransactionsContainer() {
  const [rawRows, setRawRows] = usePersistedState<StoredRawTransactionRow[]>(
    ROWS_STORAGE_KEY,
    [],
    parseStoredRawRows
  );
  const [manualEdits, setManualEdits] = usePersistedState<ManualEdits>(
    EDITS_STORAGE_KEY,
    {},
    parseStoredEdits
  );
  const [isParsing, setIsParsing] = React.useState(false);

  const { data, invalidRows } = React.useMemo(() => {
    const drafts = new TransactionCsvAdapter().adapt(rawRows);
    const result = validateRows(
      transactionSchema,
      drafts as unknown as Record<string, unknown>[]
    );
    return {
      data: applyManualEdits(result.validRows, manualEdits),
      invalidRows: result.invalidRows,
    };
  }, [rawRows, manualEdits]);

  async function handleFile(file: File) {
    setIsParsing(true);
    try {
      const text = unwrapQuotedLines(await file.text());
      const { data: uploadedRows } = await parseCsvText(text);
      const remappedRows = remapHeaders(
        uploadedRows,
        RAW_TRANSACTION_HEADER_MAP
      ) as RawTransactionRow[];
      const merged = mergeRawRows(rawRows, remappedRows);
      const added = merged.length - rawRows.length;
      setRawRows(merged);
      toast(
        `${added} filas nuevas, ${remappedRows.length - added} duplicadas omitidas`
      );
    } catch {
      toast.error("No se pudo leer el archivo CSV");
    } finally {
      setIsParsing(false);
    }
  }

  function handleDeleteRows(rows: Transaction[]) {
    const sourceIds = new Set(rows.map((row) => row.sourceId));
    setRawRows((stored) => stored.filter((row) => !sourceIds.has(row.sourceId)));
  }

  function handleDeleteLastUpload() {
    const batch = latestBatch(rawRows);
    if (batch === 0) return;
    const remaining = rawRows.filter((row) => (row.batch ?? 0) !== batch);
    const removed = rawRows.length - remaining.length;
    setRawRows(remaining);
    toast(`${removed} filas de la última carga eliminadas`);
  }

  const lastUploadCount = React.useMemo(() => {
    const batch = latestBatch(rawRows);
    return batch === 0
      ? 0
      : rawRows.filter((row) => row.batch === batch).length;
  }, [rawRows]);

  function handleCellEdit(rowIndex: number, columnId: string, value: unknown) {
    const uniqueKey = data[rowIndex]?.uniqueKey;
    if (!uniqueKey || !MANUAL_EDIT_COLUMNS.has(columnId)) return;
    const column = columnId as ManualEditColumn;

    setManualEdits((edits) => ({
      ...edits,
      [uniqueKey]: { ...edits[uniqueKey], [column]: value },
    }));
  }

  return (
    <div className="space-y-4">
      <CsvUploader
        onFileSelected={handleFile}
        invalidRows={invalidRows}
        isLoading={isParsing}
      />
      <ConfirmDeleteButton
        triggerLabel="Eliminar última carga"
        title={`¿Eliminar la última carga (${lastUploadCount} filas)?`}
        description="Se borran las filas agregadas en la carga más reciente. Esta acción no se puede deshacer."
        disabled={lastUploadCount === 0}
        onConfirm={handleDeleteLastUpload}
      />
      <DataTable
        columns={transactionsColumns}
        data={data}
        getRowId={(row) => row.sourceId}
        onCellEdit={handleCellEdit}
        onDeleteRows={handleDeleteRows}
      />
    </div>
  );
}
