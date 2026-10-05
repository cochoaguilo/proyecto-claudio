"use client";

import * as React from "react";
import type { CellContext, RowData } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

interface DataTableEditableCellProps<TData, TValue>
  extends CellContext<TData, TValue> {
  type?: "text" | "number";
  className?: string;
}

/**
 * Inline-editable cell. Keeps a local draft while typing and commits it to the
 * table through `meta.updateData` on blur or Enter. Escape discards the draft.
 */
export function DataTableEditableCell<TData, TValue>({
  getValue,
  row,
  column,
  table,
  type = "text",
  className,
}: DataTableEditableCellProps<TData, TValue>) {
  const initialValue = getValue();
  const [draft, setDraft] = React.useState(toDraft(initialValue));
  const [syncedValue, setSyncedValue] = React.useState(initialValue);

  // Resync the draft when the underlying value changes (e.g. a new CSV upload).
  if (!Object.is(syncedValue, initialValue)) {
    setSyncedValue(initialValue);
    setDraft(toDraft(initialValue));
  }

  function commit() {
    if (draft === toDraft(initialValue)) return;
    const value = type === "number" ? toNumber(draft) : draft;
    table.options.meta?.updateData?.(row.index, column.id, value);
  }

  return (
    <Input
      type={type}
      step={type === "number" ? "any" : undefined}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(toDraft(initialValue));
          event.currentTarget.blur();
        }
      }}
      aria-label={`Editar ${column.id}`}
      className={cn("h-8 min-w-24", type === "number" && "text-right", className)}
    />
  );
}

function toDraft(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

function toNumber(draft: string): number {
  const parsed = Number(draft);
  return draft.trim() === "" || Number.isNaN(parsed) ? 0 : parsed;
}
