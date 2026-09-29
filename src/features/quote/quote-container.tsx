"use client";

import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { CsvUploader } from "@/components/data-table/csv-uploader";
import { parseCsvFile } from "@/lib/csv/parse-csv";
import { remapHeaders } from "@/lib/csv/remap-headers";
import { validateRows, type InvalidRow } from "@/lib/csv/validate-rows";
import { quoteSchema, type Quote } from "@/features/quote/quote.schema";
import {
  RAW_QUOTE_HEADER_MAP,
  type RawQuoteRow,
} from "@/features/quote/raw-quote";
import { QuoteCsvAdapter } from "@/features/quote/quote-csv.adapter";
import { quoteColumns } from "@/features/quote/quote.columns";

export function QuoteContainer() {
  const [data, setData] = React.useState<Quote[]>([]);
  const [invalidRows, setInvalidRows] = React.useState<InvalidRow[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);

  async function handleFile(file: File) {
    setIsParsing(true);
    try {
      const { data: rawRows } = await parseCsvFile(file, 3);
      const remappedRows = remapHeaders(
        rawRows,
        RAW_QUOTE_HEADER_MAP
      ) as RawQuoteRow[];
      const draftRows = new QuoteCsvAdapter().adapt(remappedRows);
      const { validRows, invalidRows } = validateRows(
        quoteSchema,
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
      <DataTable columns={quoteColumns} data={data} />
    </div>
  );
}
