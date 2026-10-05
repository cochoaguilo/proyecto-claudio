"use client";

import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";

import { DataTable } from "@/components/data-table/data-table";
import { CsvUploader } from "@/components/data-table/csv-uploader";
import { remapHeaders } from "@/lib/csv/remap-headers";
import { validateRows, type InvalidRow } from "@/lib/csv/validate-rows";
import { usePersistedState } from "@/lib/storage/use-persisted-state";
import {
  positionSchema,
  type Position,
} from "@/features/positions/positions.schema";
import {
  RAW_POSITION_HEADER_MAP,
  type RawPositionRow,
} from "@/features/positions/raw-position";
import { PositionCsvAdapter } from "@/features/positions/position-csv.adapter";
import { parsePositionStatement } from "@/features/positions/parse-position-statement";
import { positionsColumns } from "@/features/positions/positions.columns";

const STORAGE_KEY = "positions:rows";
const parseStoredRows = (value: unknown) => z.array(positionSchema).parse(value);

export function PositionsContainer() {
  const [data, setData] = usePersistedState<Position[]>(
    STORAGE_KEY,
    [],
    parseStoredRows
  );
  const [invalidRows, setInvalidRows] = React.useState<InvalidRow[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);

  async function handleFile(file: File) {
    setIsParsing(true);
    try {
      const rawRows = parsePositionStatement(await file.text());
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
