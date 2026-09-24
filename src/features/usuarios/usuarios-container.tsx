"use client";

import * as React from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { CsvUploader } from "@/components/data-table/csv-uploader";
import { parseCsvFile } from "@/lib/csv/parse-csv";
import { validateRows, type InvalidRow } from "@/lib/csv/validate-rows";
import { usuarioSchema, type Usuario } from "@/features/usuarios/usuarios.schema";
import { usuariosColumns } from "@/features/usuarios/usuarios.columns";

export function UsuariosContainer() {
  const [data, setData] = React.useState<Usuario[]>([]);
  const [invalidRows, setInvalidRows] = React.useState<InvalidRow[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);

  async function handleFile(file: File) {
    setIsParsing(true);
    try {
      const { data: rawRows } = await parseCsvFile(file);
      const { validRows, invalidRows } = validateRows(usuarioSchema, rawRows);
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
      <DataTable columns={usuariosColumns} data={data} />
    </div>
  );
}
