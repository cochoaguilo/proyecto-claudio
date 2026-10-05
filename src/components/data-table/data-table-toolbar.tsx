"use client";

import type { Table } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/data-table/confirm-delete-button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onDeleteRows?: (rows: TData[]) => void;
}

export function DataTableToolbar<TData>({
  table,
  onDeleteRows,
}: DataTableToolbarProps<TData>) {
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);
  const selectedCount = selectedRows.length;

  function handleDeleteSelected() {
    onDeleteRows?.(selectedRows);
    table.resetRowSelection();
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Buscar en todas las columnas..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-full max-w-sm"
        />
        {selectedCount > 0 && (
          <Badge variant="secondary">{selectedCount} seleccionadas</Badge>
        )}
        {onDeleteRows && (
          <ConfirmDeleteButton
            triggerLabel="Eliminar seleccionadas"
            title={`¿Eliminar ${selectedCount === 1 ? "1 fila" : `${selectedCount} filas`}?`}
            description="Esta acción no se puede deshacer. Si vuelves a subir el mismo CSV, las filas regresarán."
            disabled={selectedCount === 0}
            onConfirm={handleDeleteSelected}
          />
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto h-8">
            Columnas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
