"use client";

import * as React from "react";

import type { InvalidRow } from "@/lib/csv/validate-rows";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface CsvUploaderProps {
  onFileSelected: (file: File) => void;
  invalidRows: InvalidRow[];
  isLoading: boolean;
}

export function CsvUploader({
  onFileSelected,
  invalidRows,
  isLoading,
}: CsvUploaderProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Allow re-selecting the same file to trigger another upload.
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="grid w-full max-w-sm gap-1.5">
        <Label htmlFor="csv-file">Archivo CSV</Label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          disabled={isLoading}
          onChange={handleChange}
          className="flex h-8 w-full cursor-pointer rounded-lg border border-input bg-transparent text-sm file:mr-3 file:h-full file:cursor-pointer file:border-0 file:bg-secondary file:px-2.5 file:text-sm file:font-medium file:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {isLoading && <Skeleton className="h-24 w-full" />}

      {!isLoading && invalidRows.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>
            {invalidRows.length} fila(s) con errores de validacion
          </AlertTitle>
          <AlertDescription>
            <ScrollArea className="mt-2 h-40 w-full">
              <ul className="space-y-1 pr-4">
                {invalidRows.map((row) => (
                  <li key={row.rowIndex}>
                    Fila {row.rowIndex + 1}: {row.issues.join(", ")}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
