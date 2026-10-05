import type { CsvAdapter } from "@/lib/csv/csv-adapter";
import type { StoredRawTransactionRow } from "./raw-transaction";
import {
  classifyNetAction,
  isOpeningAction,
  normalizeNumber,
  parseTransactionDate,
  parseTransactionSymbol,
} from "./transaction-parsing";

export interface TransactionDraft {
  sourceId: string;
  codigo: string;
  strategy: string;
  entryPrice: number;
  uniqueKey: string;
  symbol: string;
  instrument: string;
  date: string;
  action: string;
  description: string;
  quantity: number;
  price: number;
  feesComm: number;
  amount: number;
  positionStatus: string;
}

interface ParsedRow {
  sourceId: string;
  uniqueKey: string;
  symbol: string;
  instrument: string;
  date: string;
  action: string;
  description: string;
  quantity: number;
  price: number;
  feesComm: number;
  amount: number;
  codigo: string;
  positionStatus: string;
  entryPrice: number;
  strategy: string;
}

export class TransactionCsvAdapter
  implements CsvAdapter<StoredRawTransactionRow, TransactionDraft>
{
  adapt(rawRows: StoredRawTransactionRow[]): TransactionDraft[] {
    const parsedRows = rawRows.map((row) => this.parseRow(row));

    parsedRows.sort(
      (a, b) => a.symbol.localeCompare(b.symbol) || a.date.localeCompare(b.date)
    );

    this.assignCodigoAndStatus(parsedRows);
    this.seedEntryPriceAndStrategy(parsedRows);

    return parsedRows.map((row) => ({
      sourceId: row.sourceId,
      codigo: row.codigo,
      strategy: row.strategy,
      entryPrice: row.entryPrice,
      uniqueKey: row.uniqueKey,
      symbol: row.symbol,
      instrument: row.instrument,
      date: row.date,
      action: row.action,
      description: row.description,
      quantity: row.quantity,
      price: row.price,
      feesComm: row.feesComm,
      amount: row.amount,
      positionStatus: row.positionStatus,
    }));
  }

  private parseRow(row: StoredRawTransactionRow): ParsedRow {
    // An unparseable date or empty symbol yields "", which the zod schema
    // (both require non-empty) then surfaces as an invalidRow instead of
    // this row disappearing with no reported error.
    const date = parseTransactionDate(row.date) ?? "";
    const { uniqueKey, symbol, instrument } = parseTransactionSymbol(row.symbol);
    const quantity = Math.abs(parseFloat(row.quantity)) || 0;

    return {
      sourceId: row.sourceId,
      uniqueKey,
      symbol,
      instrument,
      date,
      action: row.action,
      description: row.description,
      quantity,
      price: normalizeNumber(row.price),
      feesComm: normalizeNumber(row.feesComm),
      amount: normalizeNumber(row.amount),
      codigo: "",
      positionStatus: "",
      entryPrice: 0,
      strategy: "",
    };
  }

  private assignCodigoAndStatus(rows: ParsedRow[]): void {
    let codigoCounter = 0;
    let index = 0;

    while (index < rows.length) {
      const symbol = rows[index].symbol;
      let netQuantity = 0;
      let currentGroup: ParsedRow[] = [];

      while (index < rows.length && rows[index].symbol === symbol) {
        const row = rows[index];

        if (netQuantity === 0) {
          codigoCounter += 1;
        }

        row.codigo = `TX${String(codigoCounter).padStart(3, "0")}`;
        currentGroup.push(row);

        netQuantity += classifyNetAction(row.action) * row.quantity;

        if (netQuantity === 0) {
          this.markGroupStatus(currentGroup, "Closed");
          currentGroup = [];
        }

        index += 1;
      }

      if (currentGroup.length > 0) {
        this.markGroupStatus(currentGroup, "Open");
      }
    }
  }

  private markGroupStatus(group: ParsedRow[], status: string): void {
    for (const row of group) {
      row.positionStatus = status;
    }
  }

  private seedEntryPriceAndStrategy(rows: ParsedRow[]): void {
    const seedByCodigo = new Map<string, number>();

    for (const row of rows) {
      if (seedByCodigo.has(row.codigo)) continue;
      if (isOpeningAction(row.action)) {
        seedByCodigo.set(row.codigo, row.price);
      }
    }

    for (const row of rows) {
      row.entryPrice = seedByCodigo.get(row.codigo) ?? 0;
      row.strategy = "";
    }
  }
}
