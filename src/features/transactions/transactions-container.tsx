"use client";

import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { CsvUploader } from "@/components/data-table/csv-uploader";
import { parseCsvFile } from "@/lib/csv/parse-csv";
import { remapHeaders } from "@/lib/csv/remap-headers";
import { validateRows, type InvalidRow } from "@/lib/csv/validate-rows";
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

export function TransactionsContainer() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [invalidRows, setInvalidRows] = React.useState<InvalidRow[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);

  async function handleFile(file: File) {
    setIsParsing(true);
    try {
      const { data: rawRows } = await parseCsvFile(file);
      const remappedRows = remapHeaders(
        rawRows,
        RAW_TRANSACTION_HEADER_MAP
      ) as RawTransactionRow[];
      const draftRows = new TransactionCsvAdapter().adapt(remappedRows);
      const { validRows, invalidRows } = validateRows(
        transactionSchema,
        draftRows as unknown as Record<string, unknown>[]
      );
      setData(validRows);
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

  return (
    <div className="space-y-4">
      <CsvUploader
        onFileSelected={handleFile}
        invalidRows={invalidRows}
        isLoading={isParsing}
      />
      <DataTable columns={transactionsColumns} data={data} />
    </div>
  );
}
