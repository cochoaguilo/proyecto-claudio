"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DataTableDeleteRowsProps {
  count: number;
  onConfirm: () => void;
}

/** Deletes the selected rows only after the user confirms in a dialog. */
export function DataTableDeleteRows({
  count,
  onConfirm,
}: DataTableDeleteRowsProps) {
  const [open, setOpen] = React.useState(false);
  const rowsLabel = count === 1 ? "1 fila" : `${count} filas`;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="h-8">
          Eliminar seleccionadas
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar {rowsLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Si vuelves a subir el mismo CSV,
            las filas regresarán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
