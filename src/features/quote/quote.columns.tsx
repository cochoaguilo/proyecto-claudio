"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { Quote } from "@/features/quote/quote.schema";

export const quoteColumns: ColumnDef<Quote>[] = [
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
    accessorKey: "fecha",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
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
    accessorKey: "week52High",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="52High"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.week52High.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "week52Low",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="52Low"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.week52Low.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "movAvgExponential",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="MovAvgExponential"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.movAvgExponential.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "low100Day",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="100-day-Low"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.low100Day.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "high",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="High"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.high.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "low",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Low"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.low.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "bollingerBands",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BollingerBands" />
    ),
  },
  {
    accessorKey: "sma10w",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SMA 10W"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.sma10w.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "macStop",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="MAC_STOP"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.macStop.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "trendPilotStop",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="TrendPilot_STOP"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.trendPilotStop.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "sma10d",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SMA 10d"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.sma10d.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "sma100d",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SMA 100d"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.sma100d.toFixed(2)}</div>
    ),
  },
];
