"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Position } from "@/features/positions/positions.schema";

export const positionsColumns: ColumnDef<Position>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "key",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Key" />
    ),
  },
  {
    accessorKey: "symbol",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Symbol" />
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Quantity"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "days",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Days"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.days.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "tradePrice",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trade Price"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.tradePrice.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "mark",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Mark"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.mark.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "last",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.last.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "stockMark",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Stock Mark"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.stockMark.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "stockLast",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Stock Last"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.stockLast.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "deltaPosition",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Delta Position"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.deltaPosition.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "theta",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Theta"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.theta.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "optionDelta",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="OptionDelta"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.optionDelta.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "optionTheta",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="OptionTheta"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.optionTheta.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "netLiq",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Net Liq"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.netLiq.toFixed(2)}</div>
    ),
  },
];
