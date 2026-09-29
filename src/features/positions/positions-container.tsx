"use client";

import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { CsvUploader } from "@/components/data-table/csv-uploader";
import { parseCsvFile } from "@/lib/csv/parse-csv";
import { remapHeaders } from "@/lib/csv/remap-headers";
import { validateRows, type InvalidRow } from "@/lib/csv/validate-rows";
import {
  positionSchema,
  type Position,
} from "@/features/positions/positions.schema";
import {
  RAW_POSITION_HEADER_MAP,
  type RawPositionRow,
} from "@/features/positions/raw-position";
import { PositionCsvAdapter } from "@/features/positions/position-csv.adapter";
import { positionsColumns } from "@/features/positions/positions.columns";

export function PositionsContainer() {
  const [data, setData] = React.useState<Position[]>([]);
  const [invalidRows, setInvalidRows] = React.useState<InvalidRow[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);

  async function handleFile(file: File) {
    setIsParsing(true);
    try {
      const { data: rawRows } = await parseCsvFile(file, 6, 11);
      const remappedRows = remapHeaders(
        rawRows,
        RAW_POSITION_HEADER_MAP
      ) as RawPositionRow[];
      const draftRows = new PositionCsvAdapter().adapt(remappedRows);
      const { validRows, invalidRows } = validateRows(
        positionSchema,
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
      <DataTable columns={positionsColumns} data={data} />
    </div>
  );
}
