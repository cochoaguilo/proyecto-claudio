"use client";

import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { DataTable } from "@/components/data-table/data-table";
import { CsvUploader } from "@/components/data-table/csv-uploader";
import { parseCsvText } from "@/lib/csv/parse-csv";
import { remapHeaders } from "@/lib/csv/remap-headers";
import { unwrapQuotedLines } from "@/lib/csv/unwrap-quoted-lines";
import { validateRows, type InvalidRow } from "@/lib/csv/validate-rows";
import { usePersistedState } from "@/lib/storage/use-persisted-state";
import {
  transactionSchema,
  type Transaction,
} from "@/features/transactions/transactions.schema";
import {
  RAW_TRANSACTION_HEADER_MAP,
  type RawTransactionRow,
} from "@/features/transactions/raw-transaction";
import { TransactionCsvAdapter } from "@/features/transactions/transaction-csv.adapter";
import { transactionsColumns } from "@/features/transactions/transactions.columns";

const ROWS_STORAGE_KEY = "transactions:rows";
const EDITS_STORAGE_KEY = "transactions:manual-edits";

/** Columns filled in by hand; they survive CSV re-imports, keyed by uniqueKey. */
const manualEditSchema = transactionSchema
  .pick({ strategy: true, entryPrice: true, aux: true })
  .partial();
const manualEditsSchema = z.record(z.string(), manualEditSchema);

type ManualEdits = z.infer<typeof manualEditsSchema>;
type ManualEditColumn = keyof z.infer<typeof manualEditSchema>;

const MANUAL_EDIT_COLUMNS = new Set<string>(
  Object.keys(manualEditSchema.shape)
);

const parseStoredRows = (value: unknown) =>
  z.array(transactionSchema).parse(value);
const parseStoredEdits = (value: unknown) => manualEditsSchema.parse(value);

function applyManualEdits(rows: Transaction[], edits: ManualEdits) {
  return rows.map((row) => ({ ...row, ...edits[row.uniqueKey] }));
}

export function TransactionsContainer() {
  const [data, setData] = usePersistedState<Transaction[]>(
    ROWS_STORAGE_KEY,
    [],
    parseStoredRows
  );
  const [manualEdits, setManualEdits] = usePersistedState<ManualEdits>(
    EDITS_STORAGE_KEY,
    {},
    parseStoredEdits
  );
  const [invalidRows, setInvalidRows] = React.useState<InvalidRow[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);

  async function handleFile(file: File) {
    setIsParsing(true);
    try {
      const text = unwrapQuotedLines(await file.text());
      const { data: rawRows } = await parseCsvText(text);
      const remappedRows = remapHeaders(
        rawRows,
        RAW_TRANSACTION_HEADER_MAP
      ) as RawTransactionRow[];
      const draftRows = new TransactionCsvAdapter().adapt(remappedRows);
      const { validRows, invalidRows } = validateRows(
        transactionSchema,
        draftRows as unknown as Record<string, unknown>[]
      );
      setData(applyManualEdits(validRows, manualEdits));
      setInvalidRows(invalidRows);
      toast(
        `${validRows.length} filas importadas, ${invalidRows.length} con errores`
      );
    } catch {
      toast.error("No se pudo leer el archivo CSV");
    } finally {
      setIsParsing(false);
    }
  }

  function handleCellEdit(rowIndex: number, columnId: string, value: unknown) {
    const uniqueKey = data[rowIndex]?.uniqueKey;
    if (!uniqueKey || !MANUAL_EDIT_COLUMNS.has(columnId)) return;
    const column = columnId as ManualEditColumn;

    setManualEdits((edits) => ({
      ...edits,
      [uniqueKey]: { ...edits[uniqueKey], [column]: value },
    }));
    setData((rows) =>
      rows.map((row) =>
        row.uniqueKey === uniqueKey ? { ...row, [column]: value } : row
      )
    );
  }

  return (
    <div className="space-y-4">
      <CsvUploader
        onFileSelected={handleFile}
        invalidRows={invalidRows}
        isLoading={isParsing}
      />
      <DataTable
        columns={transactionsColumns}
        data={data}
        onCellEdit={handleCellEdit}
      />
    </div>
  );
}
